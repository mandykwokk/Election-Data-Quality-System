import React, { useContext } from 'react';
import { Popover } from 'antd';
import DistrictContext from 'contexts/DistrictContext';
import Demographic from './PanelCharts/Demographic';
import Election from './PanelCharts/Election';

export default function DistrictTab() {
    const selectedCd = useContext(DistrictContext);

    return (
        <React.Fragment>
            <Popover
                placement="topRight" 
                title={"District Boundary Source"}
                content=
                {
                    <>
                        <p>US Census</p>
                        <p>https://www2.census.gov/geo/pvs/tiger2010st</p>
                    </>
                }
            >
            <p className="sourceText"><span className="sourceBg">District Boundary Source</span></p>
            </Popover>
            <div className="infoPane">
                <h1>District: {selectedCd.name}</h1>
            </div>
            <Election data={selectedCd.elections} name={selectedCd.name} region={selectedCd}/>
            <Demographic data={selectedCd.demographic} name={selectedCd.name}/>
        </React.Fragment>
    );
}