import React, { useState } from 'react';
import { List, Divider, Popover, Typography, message } from 'antd';
import  Demographic  from './PanelCharts/Demographic';
import  Election  from './PanelCharts/Election';
import * as Constants from 'constants/constants';
import PrecinctRequester from 'requesters/PrecinctRequester';

const { Paragraph } = Typography;
const precinctRequester = new PrecinctRequester();

export default function PrecinctTab(props) {
    const [rerender, setRerender] = useState(false);

    async function onChange(value) {
        if (await precinctRequester.updateName(props.selectedPrecinct.id, value)) {
            props.selectedPrecinct.name = value;
            message.success("Sucessfully changed name");
            setRerender(!rerender);
        }
        else {
            message.error("Failed to change name");
        }
    }

    return (
        <React.Fragment>
            <Popover
                placement="topRight" 
                title={"Precinct Boundary Source"}
                content=
                {
                    <>
                        <p>US Census</p>
                        <p>https://www2.census.gov/geo/pvs/tiger2010st</p>
                    </>
                }
            >
                <p className="sourceText"><span className="sourceBg">Precinct Boundary Source</span></p>
            </Popover>
            <br />
            <div className="infoPane">
                <h1>Precinct:&nbsp; 
                    {props.selectedPrecinct.countyName === " N/A"
                    ?
                    <Paragraph style={{display: "inline"}} editable={{ onChange: value => onChange(value)}}>{props.selectedPrecinct.name}</Paragraph>
                    : props.selectedPrecinct.name}
                </h1>
                <h1>District: {props.selectedPrecinct.districtName}</h1>
                <h1>County: {props.selectedPrecinct.countyName}</h1>
                <h1>id: {props.selectedPrecinct.id}</h1>
            </div>
            <Election data={props.selectedPrecinct.elections} name={props.selectedPrecinct.id} region={props.selectedPrecinct} editable={true}/>
            <Demographic data={props.selectedPrecinct.demographic} precinct={props.selectedPrecinct} editable={true}/>
            <Divider />
            <h1 className="chartHeader">Errors</h1>
            <List
                itemLayout="horizontal"
                dataSource={props.selectedPrecinct.errors}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            title={Constants.ERROR_HEADER[Constants.ERROR_ENUM.indexOf(item.category)].replace("Precincts", "Precinct")}
                            description={item.description}
                        />
                    </List.Item>
                )}
            />
        </React.Fragment>
    );
}