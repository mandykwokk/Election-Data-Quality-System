import React, { useState, useEffect, useRef } from 'react';
import { Map, TileLayer, ZoomControl, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import Control from 'react-leaflet-control';
import * as Turf from '@turf/turf';
import { Layout, Checkbox, Card, Spin, message } from 'antd';
import BorderJsonRequester from 'requesters/BorderJsonRequester';
import HistoryRequester from 'requesters/HistoryRequester';
import ErrorRequester from 'requesters/ErrorRequester';
import LayerStyler from 'utils/LayerStyler';
import * as Constants from 'constants/constants';
import StateContext from 'contexts/StateContext';
import DistrictContext from 'contexts/DistrictContext';
import HistoryContext from 'contexts/HistoryContext';
import RerenderContext from 'contexts/RerenderContext';
import LeftPanel from './LeftPanel/LeftPanel';
import RightPanel from './RightPanel/RightPanel';
import CommentTab from './RightPanel/CommentTab';
import HeaderPanel from './HeaderPanel/HeaderPanel'
import moment from 'moment';
import PrecinctRequester from 'requesters/PrecinctRequester';

const borderJsonRequester = new BorderJsonRequester();
const historyRequester = new HistoryRequester();
const errorRequester = new ErrorRequester();
const layerStyler = new LayerStyler();
const precinctRequester = new PrecinctRequester();
message.config({
    top: 60,
    duration: 3
});

const NpMarker = new L.Icon({
    iconUrl: 'images/NpMarker.png',
    iconSize: [48, 48],
});


export default function MapScreen() {
    const [mapRef, setMapRef] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(4);
    const [showDistricts, setShowDistricts] = useState(true);
    const [showPrecincts, setShowPrecincts] = useState(true);
    const [showNp, setShowNp] = useState(false);
    const [showCommentTab, setShowCommentTab] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);

    const [selectedState, setSelectedState] = useState(null);
    const [selectedCd, setSelectedCd] = useState(null);
    const [selectedPrecinct, setSelectedPrecinct] = useState(null);
    const [selectedHistory, setSelectedHistory] = useState(null);

    const [stateBorders, setStateBorders] = useState(null);
    const stateLayerRefs = useRef([React.createRef(), React.createRef(), React.createRef()]);
    const [cdBorders, setCdBorders] = useState(null);
    const [precinctBorders, setPrecinctBorders] = useState(null);
    const [precinctsRef, setPrecinctsRef] = useState(null);
    const [npBorders, setNpBorders] = useState(null);

    const [npMarkers] = useState([]);

    const [history, setHistory] = useState([[], [], [], [], [], [], []]);
    const [errors, setErrors] = useState([[], [], [], [], [], [], []]);

    const [delayHandler, setDelayHandler] = useState(null)
    const [addingNeighbor, setAddingNeighbor] = useState(false)
    const [removingNeighbor, setRemovingNeighbor] = useState(false)
    const [combiningPrecinct, setCombiningPrecinct] = useState(false)
    const [rerender, setRerender] = useState(false);
    const [loading, setLoading] = useState(false);

    const [drawController, setDrawController] = useState(null);

    useEffect(() => {
        (async () => {
            setStateBorders(await borderJsonRequester.getStateBorders());
            setCdBorders(await borderJsonRequester.getCdBorders());
            const npBorders = await borderJsonRequester.getNpBorders();
            setNpBorders(npBorders);
        }
        )();
    }, [npMarkers]);

    function handleStateChangeDropdown(stateName) {
        handleStateChange(stateBorders[Constants.STATES.indexOf(stateName)], null);
    }

    async function handleStateChange(state, layer) {
        if (selectedState && state.name === selectedState.name)
            return;
        if (!layer)
            mapRef.leafletElement.fitBounds(stateLayerRefs.current[Constants.STATES.indexOf(state.name)].current.leafletElement.getBounds());
        else
            mapRef.leafletElement.fitBounds(layer.getBounds());
        setSelectedState(null);
        setSelectedState(state);
        setSelectedCd(null);
        setSelectedPrecinct(null);
        setPrecinctBorders(null);
        setShowOriginal(false);
        setHistory([[], [], [], [], [], [], []]);
        setErrors([[], [], [], [], [], [], []]);
    }

    function handlePrecinctChange(layer) {
        setSelectedPrecinct(null);
        setSelectedPrecinct(layer.feature);
    }

    async function handlePrecinctLayerOnClick(e) {
        if (addingNeighbor) {
            if (selectedPrecinct.neighbors.includes(e.layer.feature.id)) {
                message.warn('This precinct is already a neighbor');
                return;
            }
            if (precinctRequester.updateNeighbor(selectedPrecinct.id, e.layer.feature.id, true)) {
                selectedPrecinct.neighbors.push(e.layer.feature.id);
                e.layer.feature.neighbors.push(selectedPrecinct.id);
                setAddingNeighbor(false);
                handleAddHistory({ description: `Added ${e.layer.feature.name} to ${selectedPrecinct.name}'s neighbor` }, selectedPrecinct);
                handleAddHistory({ description: `Added ${selectedPrecinct.name} to ${e.layer.feature.name}'s neighbor` }, e.layer.feature);
                message.success('Successfully added neighbor');
            }
        }
        else if (removingNeighbor) {
            if (!selectedPrecinct.neighbors.includes(e.layer.feature.id)) {
                message.warn('This precinct is not a neighbor');
                return;
            }
            if (precinctRequester.updateNeighbor(selectedPrecinct.id, e.layer.feature.id, false)) {
                for (var i = 0; i < selectedPrecinct.neighbors.length; i++) {
                    if (selectedPrecinct.neighbors[i] === e.layer.feature.id)
                        selectedPrecinct.neighbors.splice(i, 1);
                }
                for (var j = 0; j < e.layer.feature.neighbors.length; j++) {
                    if (e.layer.feature.neighbors[j] === selectedPrecinct.id)
                        e.layer.feature.neighbors.splice(j, 1);
                }
                setRemovingNeighbor(false);
                setSelectedPrecinct(null);
                setSelectedPrecinct(selectedPrecinct);
                handleAddHistory({ description: `Removed ${e.layer.feature.name} from ${selectedPrecinct.name}'s neighbor` }, selectedPrecinct);
                handleAddHistory({ description: `Removed ${selectedPrecinct.name} from ${e.layer.feature.name}'s neighbor` }, e.layer.feature);
                message.success('Successfully removed neighbor');
            }
        }
        else if (combiningPrecinct) {
            if (!selectedPrecinct.neighbors.includes(e.layer.feature.id)) {
                message.error('Please select a neighbor precinct to combine.');
                return;
            }
            const clickedPrecinct = e.layer.feature;
            let newFeature = null;
            try {
                newFeature = Turf.union(
                    Turf.feature(selectedPrecinct.geometry),
                    Turf.feature(clickedPrecinct.geometry)
                );
            }
            catch(error) {
                console.log(error);
                message.error('Turf failed to merge the geometry.');
                return;
            }
            const geometryString = JSON.stringify(newFeature.geometry);
            const res = await precinctRequester.mergePrecincts({
                selectedId: selectedPrecinct.id,
                clickedId: clickedPrecinct.id,
                geometry: geometryString
            });
            if (res) {
                selectedPrecinct.geometry = newFeature.geometry;
                selectedPrecinct.errors = res.errors;
                selectedPrecinct.histories = res.histories;
                selectedPrecinct.neighbors = res.neighbors;
                selectedPrecinct.demographic = res.demographic;
                selectedPrecinct.elections = res.elections;

                clickedPrecinct.geometry = null;
                clickedPrecinct.errors = [];
                clickedPrecinct.histories = [];
                handleAddHistory({'description':`Combined precincts ${selectedPrecinct.name} with ${clickedPrecinct.name}`}, selectedPrecinct);
                for (let i = 0;i < errors.length; i++) {
                    errors[i] = [];
                }
                for (let i = 0;i < history.length; i++) {
                    history[i] = [];
                }
                precinctsRef.leafletElement.clearLayers();
                precinctsRef.leafletElement.addData(precinctBorders);
                setSelectedPrecinct(null);
                setSelectedPrecinct(selectedPrecinct);
                message.success('Successfully combined precincts.');
            }
            else {
                message.error('Failed to combine precincts.');
            }
            setCombiningPrecinct(false);
        }
        else if (selectedPrecinct && selectedPrecinct.id === e.layer.feature.id) {
            setSelectedPrecinct(null);
        }
        else {
            handlePrecinctChange(e.layer);
        }
    }

    function handlePrecinctLayerMouseOver(e) {
        if (addingNeighbor || combiningPrecinct || drawController) {
            return;
        }
        setDelayHandler(setTimeout(() => {
            handlePrecinctChange(e.layer);
        }, 500))
    }

    function handleZoomChange() {
        setZoomLevel(mapRef.viewport.zoom);
    }

    function handleShowPrecincts(e) {
        setShowPrecincts(e.target.checked);
    }

    function handleShowDistricts(e) {
        setShowDistricts(e.target.checked);
    }

    function handleShowNp(e) {
        setShowNp(e.target.checked);
    }

    function handleShowOriginalMap(e) {
        setShowOriginal(e.target.checked);
        precinctBorders.forEach(precinct => {
            let temp = precinct.geometry;
            precinct.geometry = precinct.originalGeometry;
            precinct.originalGeometry = temp;
        });
        precinctsRef.leafletElement.clearLayers();
        precinctsRef.leafletElement.addData(precinctBorders);
    }

    function handleCombinePrecinct() {
        setCombiningPrecinct(true);
        message.info('Please click on a neighbor precinct to combine.');
    }

    function handleConfirmGhostPrecinct() {
        selectedPrecinct.name = selectedPrecinct.name.substring(selectedPrecinct.name.indexOf(" ") + 1);
        if (precinctRequester.updateGhostPrecinct(selectedPrecinct.id)) {
            setRerender(!rerender);
            handleAddHistory({ description: `Confirmed precinct ${selectedPrecinct.name} is a Ghost Precinct.` }, selectedPrecinct);
            message.success('Action Completed');
        }
        else {
            message.error('Action Failed');
        }
    }

    function handleGeneratePrecinct() {
        mapRef.leafletElement.removeEventListener('draw:created');
        mapRef.leafletElement.addEventListener('draw:created', async function (e) {
            let geometry = {
                type: "Polygon",
                coordinates: [e.layer._latlngs[0].map(item => [item.lng, item.lat])]
            };
            const kinks = Turf.kinks(geometry);
            if (kinks.features.length) {
                message.error("Self-Intersection Detected, Please Do It Again!");
                drawController.disable();
                setDrawController(null);
                return;
            }
            let geometryString = JSON.stringify(geometry);
            let newPrecinct = {
                type: "Feature",
                geometry: geometryString,
                originalGeometry: null,
                errors: [],
                histories: [],
                name: "Generated Precinct",
                neighbors: [],
                comments: [],
                demographic: { "NH_AMIN": 0, "NH_NHPI": 0, "NH_ASIAN": 0, "NH_BLACK": 0, "NH_OTHER": 0, "NH_WHITE": 0 },
                elections: { PRESIDENTIAL_2016: { 'DEMOCRAT': 0, 'REPUBLICAN': 0 }, CONGRESSIONAL_2016: { 'DEMOCRAT': 0, 'REPUBLICAN': 0 }, CONGRESSIONAL_2018: { 'DEMOCRAT': 0, 'REPUBLICAN': 0 } },
                isGhost: false,
                stateName: selectedState.name,
                districtName: selectedCd.name,
                countyName: " N/A",
            };
            let res = await precinctRequester.addNewPrecinct(newPrecinct);
            if (res) {
                newPrecinct.geometry = geometry;
                newPrecinct.id = res;
                precinctBorders.push(newPrecinct);
                precinctsRef.leafletElement.clearLayers();
                precinctsRef.leafletElement.addData(precinctBorders);
                setSelectedPrecinct(newPrecinct);
                message.success(`Successfully generated a precinct.`);
                handleAddHistory({description: `Precinct generated.`}, newPrecinct);
            }
            else {
                message.error(`Failed to generated a precinct.`);
            }
            drawController.disable();
            setDrawController(null);
        });
        const drawController = new L.Draw.Polygon(mapRef.leafletElement, null);
        setDrawController(drawController);
        drawController.enable();
    }

    function handleEditPrecinctLayer() {
        const featureGroup = L.featureGroup([
            new L.polygon(selectedPrecinct.geometry.coordinates[0].map(positions => [positions[1], positions[0]]))
        ]);
        mapRef.leafletElement.addLayer(featureGroup);
        const drawController = new L.EditToolbar.Edit(mapRef.leafletElement, {
            featureGroup: featureGroup
        });
        setDrawController(drawController);

        mapRef.leafletElement.removeEventListener('draw:edited');
        mapRef.leafletElement.addEventListener('draw:edited', function (e) {
            const layersKey = Object.keys(e.layers._layers);
            if (layersKey.length === 0)
                return;
            const layer = e.layers._layers[layersKey[0]];
            const geoJson = {
                type: "Polygon",
                coordinates: [layer._latlngs[0].map(item => [item.lng, item.lat])]
            }
            const kinks = Turf.kinks(geoJson);
            if (kinks.features.length) {
                message.error("Self-Intersection Detected, Please Do It Again!");
                drawController.disable();
                setDrawController(null);
                return;
            }
            precinctRequester.updateBoundary(selectedPrecinct.id, JSON.stringify(geoJson));
            for (let i = 0;i < errors.length; i++) {
                errors[i] = [];
            }
            for (let i = 0;i < history.length; i++) {
                history[i] = [];
            }
            selectedPrecinct.geometry = geoJson;
            precinctsRef.leafletElement.clearLayers();
            precinctsRef.leafletElement.addData(precinctBorders);
            message.success(`Successfully edited ${selectedPrecinct.name}'s boundary.`);
            drawController.disable();
            setDrawController(null);
            handleAddHistory({ description: `Edited ${selectedPrecinct.name}'s boundary.` }, selectedPrecinct);
        });

        mapRef.leafletElement.removeEventListener('draw:editstop');
        mapRef.leafletElement.addEventListener('draw:editstop', function (e) {
            mapRef.leafletElement.removeLayer(featureGroup);
        });
        drawController.enable();
    }

    function handleDrawSave() {
        if (drawController instanceof L.Draw.Polygon)
            drawController.completeShape();
        else
            drawController.save();
        handleClickedCancel();
    }

    function handleClickedCancel() {
        if (addingNeighbor) {
            setAddingNeighbor(false);
            message.info('Cancelled adding neighbor.');
        }
        else if (combiningPrecinct) {
            setCombiningPrecinct(false);
            message.info('Cancelled combining precincts.');
        }
        else {
            drawController.disable();
            setDrawController(null);
        }
    }

    function handleDrawUndo() {
        if (drawController instanceof L.Draw.Polygon)
            drawController.deleteLastVertex();
        else
            drawController.revertLayers();
    }

    function handleAddNeighbor() {
        setAddingNeighbor(true);
        message.info('Please click on another precinct to add.');
    }

    function handleRemoveNeighbor() {
        setRemovingNeighbor(true);
        message.info('Please click on another precinct to remove.');
    }

    async function handleAddHistory(newHistory, precinct, layer = null) {
        newHistory.timestamp = moment();
        let res;
        if ((res = await historyRequester.postHistory(newHistory, precinct.id))) {
            if (newHistory.category)
                history[Constants.ERROR_ENUM.indexOf(newHistory.category)].push([newHistory, layer]);
            newHistory.precinct = precinct;
            newHistory.id = res;
            newHistory.comments = [];
            precinct.histories.push(newHistory);
            setRerender(!rerender);
        }
        else {
            message.error('Failed to post history.');
        }
    }

    function handleZoomInPrecinct(feature, layer) {
        setSelectedPrecinct(feature);
        mapRef.leafletElement.fitBounds(layer.getBounds());
    }

    function handleResolvedError(error, index, layer) {
        const res = errorRequester.ResolveError(error.id);
        if (res) {
            errors[index] = errors[index].filter((item) => {
                return error.id !== item[0].id;
            });

            error.precinct.errors = error.precinct.errors.filter((item) => {
                return error.id !== item.id;
            });

            const description = "Resolved error " + Constants.ERROR_HEADER[Constants.ERROR_ENUM.indexOf(error.category)]
                + ". Error description: " + error.description;
            handleAddHistory({ description, category: error.category }, error.precinct, layer);
            message.success('Successfully resolved the error.');
            setRerender(!rerender);
        }
        else {
            message.error('Failed to resolve.');
        }
    }

    function handleOpenCommentTab(history) {
        setShowCommentTab(true);
        setSelectedHistory(history);
    }

    function handleCloseCommentTab() {
        setShowCommentTab(false);
        setSelectedHistory(null);
    }

    function onEachStateFeature(state, layer) {
        layer.on({
            click: async () => {
                handleStateChange(state, layer);
            },
            mouseover: () => {
                layer.setStyle({
                    weight: 3
                });
            },
            mouseout: () => {
                layer.setStyle({
                    weight: 1
                });
            }
        });
    }

    function onEachCdFeature(district, layer) {
        layer.on({
            click: async () => {
                setLoading(true);
                setSelectedCd(null);
                setPrecinctBorders(null);
                setSelectedPrecinct(null);
                setHistory([[], [], [], [], [], [], []]);
                setErrors([[], [], [], [], [], [], []]);
                setShowOriginal(false);
                await borderJsonRequester.getPrecinctBorder(district.name).then(res => {
                    setPrecinctBorders(res);
                });
                setSelectedCd(district);
                setLoading(false);
            },
            mouseover: () => {
                layer.setStyle({
                    weight: 3
                });
            },
            mouseout: () => {
                layer.setStyle({
                    weight: 1
                });
            }
        });
    }

    function onEachPrecinctFeature(precinct, layer) {
        precinct.errors.forEach((item, index) => {
            item.precinct = precinct;
            if (item.category)
                errors[Constants.ERROR_ENUM.indexOf(item.category)].push([item, layer]);
        });

        precinct.histories.forEach((item, index) => {
            item.precinct = precinct;
            if (item.category)
                history[Constants.ERROR_ENUM.indexOf(item.category)].push([item, layer]);
        });
    }

    return (
        <Layout>
            <StateContext.Provider value={selectedState}>
                <DistrictContext.Provider value={selectedCd}>
                    <HistoryContext.Provider value={handleAddHistory}>
                        <RerenderContext.Provider value={[rerender, setRerender]}>
                            <LeftPanel
                                errors={errors}
                                precincts={precinctBorders}
                                history={history}
                                handleZoomInPrecinct={handleZoomInPrecinct}
                                handleResolvedError={handleResolvedError}
                                handleOpenCommentTab={handleOpenCommentTab}
                            />
                            <Layout>
                                <Layout.Header>
                                    <HeaderPanel
                                        selectedPrecinct={selectedPrecinct}
                                        zoomLevel={zoomLevel}
                                        handleStateChangeDropdown={handleStateChangeDropdown}
                                        combiningPrecinct={combiningPrecinct}
                                        handleCombinePrecinct={handleCombinePrecinct}
                                        addingNeighbor={addingNeighbor}
                                        removingNeighbor={removingNeighbor}
                                        handleAddNeighbor={handleAddNeighbor}
                                        handleRemoveNeighbor={handleRemoveNeighbor}
                                        handleConfirmGhostPrecinct={handleConfirmGhostPrecinct}
                                        handleEditPrecinctLayer={handleEditPrecinctLayer}
                                        drawController={drawController}
                                        handleClickedCancel={handleClickedCancel}
                                        handleDrawSave={handleDrawSave}
                                        handleDrawUndo={handleDrawUndo}
                                        handleGeneratePrecinct={handleGeneratePrecinct}
                                    />
                                </Layout.Header>
                                <Spin spinning={loading} size="large">
                                    <Layout.Content>
                                        <Map
                                            ref={(ref) => { setMapRef(ref); }}
                                            center={Constants.MAP_CENTER}
                                            zoom={4}
                                            zoomControl={false}
                                            animate={true}
                                            onZoomEnd={handleZoomChange}
                                            preferCanvas={true}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaGFubGl1IiwiYSI6ImNrNnk3YTZpMzBlcjczZW15cmU1Mm5hMWkifQ.dW0oDKWDng4w-osIkRvLsQ"
                                            />
                                            <ZoomControl position='bottomright' />
                                            <Control position="bottomleft" >
                                                <Card>
                                                    <Checkbox
                                                        defaultChecked={true}
                                                        onChange={handleShowDistricts}
                                                        disabled={zoomLevel < Constants.DP_ZOOM_LEVEL || !selectedState}
                                                    >
                                                        Show Districts
                                                    </Checkbox>
                                                    <br />
                                                    <Checkbox
                                                        defaultChecked={true}
                                                        onChange={handleShowPrecincts}
                                                        disabled={zoomLevel < Constants.DP_ZOOM_LEVEL || !selectedCd}
                                                    >
                                                        Show Precincts
                                                    </Checkbox>
                                                    <br />
                                                    <Checkbox onChange={handleShowNp}>
                                                        Show National Parks &nbsp;
                                                        <img src="images/NpIcon.png" alt="National Park Icon" className="icon" />
                                                    </Checkbox>
                                                    <br />
                                                    <Checkbox
                                                        checked={showOriginal}
                                                        onChange={handleShowOriginalMap}
                                                        disabled={zoomLevel < Constants.DP_ZOOM_LEVEL || !selectedCd || !showPrecincts}
                                                    >
                                                        Show Original Precinct Map &nbsp;
                                                    </Checkbox>
                                                </Card>
                                            </Control>

                                            {stateBorders &&
                                                stateBorders.map((stateBorder, index) => {
                                                    if (selectedState
                                                        && stateBorder.name === selectedState.name
                                                        && zoomLevel >= Constants.DP_ZOOM_LEVEL
                                                        && (showDistricts || (showPrecincts && selectedCd))
                                                    ) {
                                                        return (
                                                            <React.Fragment key={"F" + index}>
                                                                {showDistricts && <GeoJSON
                                                                    key={"CD" + index}
                                                                    data={cdBorders[Constants.STATES.indexOf(selectedState.name)]}
                                                                    style={layerStyler.geoJSONCdStyle}
                                                                    onEachFeature={onEachCdFeature}
                                                                />
                                                                }
                                                                {(showPrecincts && precinctBorders) && <GeoJSON
                                                                    key={"P" + index}
                                                                    ref={(ref) => { setPrecinctsRef(ref); }}
                                                                    data={precinctBorders}
                                                                    style={(feature) => layerStyler.geoJSONPrecinctStyle(feature, selectedPrecinct)}
                                                                    onEachFeature={onEachPrecinctFeature}
                                                                    onClick={handlePrecinctLayerOnClick}
                                                                    onMouseOver={handlePrecinctLayerMouseOver}
                                                                    onMouseOut={() => clearTimeout(delayHandler)}
                                                                />
                                                                }
                                                            </React.Fragment>
                                                        );
                                                    }
                                                    else {
                                                        return (
                                                            <GeoJSON
                                                                key={"S" + index}
                                                                ref={stateLayerRefs.current[index]}
                                                                data={stateBorder}
                                                                style={layerStyler.geoJSONStateStyle}
                                                                onEachFeature={onEachStateFeature}
                                                            />
                                                        );
                                                    }
                                                })
                                            }
                                            {(npBorders && showNp) && (
                                                <React.Fragment>
                                                    <GeoJSON
                                                        data={npBorders}
                                                        style={(feature) => layerStyler.geoJSONNpStyle(feature)}
                                                    />
                                    )}
                                                    {npMarkers.map((feature, index) =>
                                                        <Marker
                                                            key={`marker-${index}`}
                                                            position={feature.geometry.coordinates}
                                                            icon={NpMarker}
                                                        >
                                                            <Popup>
                                                                <span>Name: {feature.properties.name}</span>
                                                            </Popup>
                                                        </Marker>
                                                    )}
                                                </React.Fragment>
                                            )}
                                        </Map>
                                    </Layout.Content>
                                </Spin>
                            </Layout>
                            <RightPanel selectedPrecinct={selectedPrecinct} selectedCd={selectedCd} />
                            <CommentTab
                                showCommentTab={showCommentTab}
                                handleCloseCommentTab={handleCloseCommentTab}
                                selectedHistory={selectedHistory}
                            />
                        </RerenderContext.Provider>
                    </HistoryContext.Provider>
                </DistrictContext.Provider>
            </StateContext.Provider>
        </Layout>

    );
}