import React, { useState, useContext } from 'react';
import { Table, Popover, Divider, Typography, Button, InputNumber, message } from 'antd';
import { SaveOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import HistoryContext from 'contexts/HistoryContext';
import * as Constants from 'constants/constants';
import PrecinctRequester from 'requesters/PrecinctRequester';
import StateContext from 'contexts/StateContext';
import DistrictContext from 'contexts/DistrictContext';

const { Paragraph } = Typography;
const { Text } = Typography;
const precinctRequester = new PrecinctRequester();

export default function Demographic(props) {
    const handleAddHistory = useContext(HistoryContext);
    const selectedCd = useContext(DistrictContext);
    const selectedState = useContext(StateContext);
    const [editing, setEditing] = useState(false);
    const [originalData, setOriginalData] = useState(null);

    const columns = [
        {
            title: 'Race',
            dataIndex: 'race',
            key: 'race'
        },
        {
            title: 'Population',
            dataIndex: 'population',
            key: 'population',
            render: (population, record, index) => (
                editing
                    ? <InputNumber 
                        defaultValue={population}
                        formatter={value => value.toLocaleString()}
                        parser={value => value.replace(',', '')}
                        onChange={value => onChange(value, index)}
                        min={0} 
                    />
                    : <Paragraph>{population.toLocaleString()+""}</Paragraph>

            ),
            width: 100
        },
        {
            title: 'Percent',
            dataIndex: 'percent',
            key: 'percent',
        }
    ];


    function getData() {
        let sum = 0;
        for(let i in props.data) {
            sum += props.data[i];
        }
        const displayData = Constants.RACE_ENUM.map((item, index) => {
            return {
                key: index,
                race: Constants.RACE_GROUPS[index],
                population: props.data[item],
                percent: (props.data[item]/sum*100).toFixed(1) + "%"
            }
        });
        return displayData;
    }

    function getSum() {
        let sum = 0;
        for(let i in props.data) {
            sum += props.data[i];
        }
        return sum;
    }

    function onChange(value, index) {
        value = Number(value);
        props.data[Constants.RACE_ENUM[index]] = value;
    }

    function handleEdit() {
        setOriginalData(JSON.parse(JSON.stringify(props.data)));
        setEditing(true);
    }

    function handleSave() {
        setEditing(false);
        if (precinctRequester.updateDemographic(props.precinct.id, props.data)) {
            message.success("Sucessfully saved.");

            Object.entries(selectedCd.demographic).forEach(([key, value]) => {
                selectedCd.demographic[key] = value + props.data[key] - originalData[key];
            });
            Object.entries(selectedState.demographic).forEach(([key, value]) => {
                selectedState.demographic[key] = value + props.data[key] - originalData[key];
            });
            let description = "";
            Object.entries(originalData).forEach(([key, value]) => {
                if (originalData[key] !== props.data[key]) {
                    description += "Changed " + Constants.RACE_GROUPS[Constants.RACE_ENUM.indexOf(key)] 
                        + " population from " + originalData[key].toLocaleString() + " to " + props.data[key].toLocaleString() + ". ";
                }
            });

            handleAddHistory({description: description}, props.precinct);
        }
        else {
            message.error("Failed to save.");
        }
    }

    function handleCancel() {
        props.data = originalData;
        setEditing(false);
    }
    return (
        <React.Fragment>
            <Divider />
            <h1 className="chartHeader">Demographic Data</h1>
            <div className="spacebtw">
                {
                    props.editable
                    ? 
                        editing
                        ?
                        <div className="inlineblock">
                            <div className="saveDiv">
                                <Button
                                    title="Save"
                                    type="primary"
                                    shape="round"
                                    icon={<SaveOutlined style={{fontSize: '16px'}}/>}
                                    onClick={handleSave}
                                />
                            </div>
                            <div className="deleteDiv">
                                <Button
                                    title="Cancel"
                                    type="primary"
                                    shape="round"
                                    icon={<DeleteOutlined style={{fontSize: '16px'}}/>}
                                    onClick={handleCancel}
                                />
                            </div>
                        </div>
                    :
                        <div className="undoDiv">
                            <Button
                                title="Edit"
                                type="primary"
                                shape="round"
                                icon={<EditOutlined style={{fontSize: '16px'}}/>}
                                onClick={handleEdit}
                            />
                        </div>
                    :
                    <p />
                }
                <Popover
                    placement="topRight" 
                    title={"Source of Data"}
                    content={
                    <>
                        <p>US Census 2010, the precinct-level data is obtained by aggregating the block-level data.</p>
                        <p>https://www2.census.gov/geo/pvs/tiger2010st/</p>
                        <p>https://api.census.gov/data/2010/dec/sf1/variables.html</p>
                    </>
                    }
                >
                        <p className="sourceText"><span className="sourceBg">Source of Data</span></p>
                </Popover>
            </div>
            <br />

            <Table
                columns={columns}
                dataSource={getData()}
                pagination={false}
                size={'small'}

                summary={() => {
                    return (
                        <tr>
                            <th>Total</th>
                            <td>
                                <Text type="danger">{getSum().toLocaleString()}</Text>
                            </td>
                        </tr>
                    );
                }}
            />
        </React.Fragment>
    );
}