import React, { useContext } from 'react';
import { Popover } from 'antd';
import StateContext from 'contexts/StateContext';
import  Demographic  from './PanelCharts/Demographic';
import  Election  from './PanelCharts/Election';

export default function StateTab(props) {
    const selectedState = useContext(StateContext);
    return (
        <React.Fragment>
            <Popover
                placement="topRight" 
                title={"State Boundary Source"}
                content=
                {
                    <>
                        <p>US Census</p>
                        <p>https://www2.census.gov/geo/pvs/tiger2010st</p>
                    </>
                }
            >
            <p className="sourceText"><span className="sourceBg">State Boundary Source</span></p>
            </Popover>
            <div className="infoPane">
                <h1>State: {selectedState.name}</h1>
            </div>
            <br />
            <Election data={selectedState.elections} name={selectedState.name} region={selectedState}/>
            <Demographic data={selectedState.demographic} name={selectedState.name}/>
        </React.Fragment>
    );
}