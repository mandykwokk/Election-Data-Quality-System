import React, { useContext } from 'react';
import { Button, Menu, Dropdown } from 'antd';
import {
    DownOutlined, AliwangwangOutlined, MergeCellsOutlined, UsergroupAddOutlined,
    UndoOutlined, EditOutlined, DeleteOutlined, SaveOutlined,
    EnvironmentOutlined, FormOutlined,
    SplitCellsOutlined, UsergroupDeleteOutlined
} from '@ant-design/icons';
import StateContext from 'contexts/StateContext';
import DistrictContext from 'contexts/DistrictContext';
import * as Constants from 'constants/constants';

export default function HeaderPanel(props) {
    const selectedState = useContext(StateContext);
    const selectedCd = useContext(DistrictContext);

    function getSum() {
        let sum = 0;
        if (props.selectedPrecinct) {
            if (props.selectedPrecinct.name.includes("Potential")) {
                for (let i in props.selectedPrecinct.demographic) {
                    sum += props.selectedPrecinct.demographic[i];
                }
                return sum;
            }
        }
        return 1;

    }

    return (
        <React.Fragment>
            <Dropdown
                overlay={
                    <Menu onClick={({ key }) => props.handleStateChangeDropdown(key)}>
                        {
                            Constants.STATES.map(state => {
                                return (
                                    <Menu.Item key={state}>
                                        <EnvironmentOutlined />{state}
                                    </Menu.Item>
                                );
                            }
                            )
                        }
                    </Menu>
                }
            >
                <div className="locationDiv">
                    <Button
                        type="primary"
                        icon={<EnvironmentOutlined />}
                        shape="round"
                    >
                        {(selectedState && selectedState.name) || 'Select a State'} <DownOutlined />
                    </Button>
                </div>
            </Dropdown>
            <div className="saveDiv">
                <Button
                    title="Save"
                    type="primary"
                    shape="round"
                    icon={<SaveOutlined
                        style={{ fontSize: '18px' }} />}
                    onClick={props.handleDrawSave}
                    disabled={props.drawController === null}
                />
            </div>
            <div className="deleteDiv">
                <Button
                    title="Cancel"
                    type="primary"
                    shape="round"
                    icon={<DeleteOutlined
                        style={{ fontSize: '18px' }} />}
                    onClick={props.handleClickedCancel}
                    disabled={
                        props.drawController === null
                        && !props.addingNeighbor
                        && !props.combiningPrecinct
                    }
                />
            </div>
            <div className="undoDiv">
                <Button
                    title="Undo"
                    type="primary"
                    shape="round"
                    icon={<UndoOutlined
                        style={{ fontSize: '18px' }} />}
                    onClick={props.handleDrawUndo}
                    disabled={props.drawController === null}
                />
            </div>

            <Dropdown
                overlay={
                    <Menu>
                        <Menu.Item
                            disabled={
                                getSum()
                            }
                            onClick={props.handleConfirmGhostPrecinct}
                        >
                            <AliwangwangOutlined style={{ fontSize: '22px', color: "#996FCF" }} /> Confirm Ghost Precinct
                        </Menu.Item>
                        <Menu.Item
                            disabled={
                                props.selectedPrecinct === null
                                || props.drawController
                                || props.addingNeighbor
                                || props.combiningPrecinct
                                || props.selectedPrecinct.geometry.type === "MultiPolygon"
                            }
                            onClick={props.handleEditPrecinctLayer}
                        >
                            <FormOutlined style={{ fontSize: '22px', color: "#ED7653" }} /> Edit Precinct Boundary
                        </Menu.Item>
                        <Menu.Item
                            disabled={
                                props.selectedPrecinct === null
                                || props.drawController
                                || props.addingNeighbor
                            }
                            onClick={props.handleCombinePrecinct}
                        >
                            <MergeCellsOutlined style={{ fontSize: '22px', color: "#F0D55C" }} />Combine Precincts
                        </Menu.Item>
                        <Menu.Item
                            disabled={
                                props.selectedPrecinct === null
                                || props.drawController
                                || props.combiningPrecinct
                            }
                            onClick={props.handleAddNeighbor}
                        >
                            <UsergroupAddOutlined style={{ fontSize: '22px', color: "#6c93df" }} />Add Precinct Neighbor
                        </Menu.Item>
                        <Menu.Item
                            disabled={
                                props.selectedPrecinct === null
                                || props.drawController
                                || props.combiningPrecinct
                            }
                            onClick={props.handleRemoveNeighbor}
                        >
                            <UsergroupDeleteOutlined style={{ fontSize: '22px', color: "#FE7274" }} />Remove Precinct Neighbor
                        </Menu.Item>
                        <Menu.Item
                            disabled={
                                selectedCd === null
                                || props.drawController
                                || props.addingNeighbor
                                || props.combiningPrecinct
                            }
                            onClick={props.handleGeneratePrecinct}
                        >
                            <SplitCellsOutlined style={{ fontSize: '22px', color: "#59D6B9" }} />Generate New Precinct
                        </Menu.Item>
                    </Menu>
                }
            >
                <div className="editDiv">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        shape="round"
                    >
                        &nbsp;&nbsp;&nbsp;Edit&nbsp;&nbsp;&nbsp;<DownOutlined />
                    </Button>
                </div>
            </Dropdown>
        </React.Fragment>
    );
}