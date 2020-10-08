import React, { useContext, useState } from 'react';
import { Divider, Popover, Typography, Table ,  Button, Menu, Dropdown} from 'antd';
import Slider from "react-slick";
import { Pie } from 'react-chartjs-2';
import * as Constants from 'constants/constants';
import HistoryContext from 'contexts/HistoryContext';
import StateContext from 'contexts/StateContext';
import DistrictContext from 'contexts/DistrictContext';
import { message } from 'antd';
import {DownOutlined, CalendarOutlined} from '@ant-design/icons';
import PrecinctRequester from 'requesters/PrecinctRequester';
const precinctRequester = new PrecinctRequester();

const { Paragraph } = Typography;

export default function Election(props) {
    const handleAddHistory = useContext(HistoryContext);
    const [rerender, setRerender] = useState(false);
    const [data, setData] = useState(props.data);
    const [selectedRegion, setSelectedRegion] = useState(props.name);
    const [selectedElection, setSelectedElection] = useState(Constants.ELECTIONS[0]);
    const selectedState = useContext(StateContext);
    const selectedCd = useContext(DistrictContext);
    var originalData;
    const columns = [
        {
            title: 'Party',
            dataIndex: 'party',
            key: 'party'
        },
        {
            title: 'Votes',
            dataIndex: 'votes',
            key: 'votes',
            render: (votes, record, index) => (
                props.editable?
                    <Paragraph editable={{ onChange: value => onChange(value, index)}}>{votes.toLocaleString()+""}</Paragraph>
                :
                    <Paragraph>{votes.toLocaleString()+""}</Paragraph>
                ),
            width: 100,
        },
        {
            title: 'Percent',
            dataIndex: 'percent',
            key: 'percent',
        }
    ];

    function getData() {
        if(Constants.STATES.includes(selectedRegion)&&selectedRegion!==selectedState.name){
           setData(selectedState.elections);
           setSelectedRegion(selectedState.name);
       }
        let displayData = [];
        let sum = 0;
        let index = Constants.ELECTIONS.indexOf(selectedElection);
        for(let i in data) {
            if(i===Constants.ELECTIONS_ENUM[index]){
                displayData.push(data[i][Constants.PARTIES_ENUM[0]]);
                displayData.push(data[i][Constants.PARTIES_ENUM[1]]);
                sum += Number(data[i][Constants.PARTIES_ENUM[0]]);
                sum += Number(data[i][Constants.PARTIES_ENUM[1]]);
            }
        }
        displayData = displayData.map((item, index) => {
            return {
                key: index,
                party: Constants.PARTIES[index],
                votes: item,
                percent: (item/sum*100).toFixed(1)
            }
        });
        return displayData;
    }

    function onChange(value, index) {
        let elecionIndex = Constants.ELECTIONS.indexOf(selectedElection);
        value = value.replace(",", '');
        if(isNaN(value)||value.includes(".")||value.includes("-")||value===""){
            message.warn("Please enter a valid number");
            return;
        }
        value = parseInt(value);
        originalData = JSON.parse(JSON.stringify(data));
        data[Constants.ELECTIONS_ENUM[elecionIndex]][[Constants.PARTIES_ENUM[index]]] = value;//frontend data changed
        Object.entries(selectedCd.elections[Constants.ELECTIONS_ENUM[elecionIndex]]).forEach(([key, value]) => {
            selectedCd.elections[Constants.ELECTIONS_ENUM[elecionIndex]][key] += (data[Constants.ELECTIONS_ENUM[elecionIndex]][key]-originalData[Constants.ELECTIONS_ENUM[elecionIndex]][key]);
        });
        Object.entries(selectedState.elections[Constants.ELECTIONS_ENUM[elecionIndex]]).forEach(([key, value]) => {
            selectedState.elections[Constants.ELECTIONS_ENUM[elecionIndex]][key] += (data[Constants.ELECTIONS_ENUM[elecionIndex]][key]-originalData[Constants.ELECTIONS_ENUM[elecionIndex]][key]);
        });
        if(!isNaN(selectedRegion)){//precinct
            if(precinctRequester.updateElection(Number(selectedRegion), data,selectedCd.elections, selectedState.elections)){
                message.success("Election data saved");
                props.data[Constants.ELECTIONS_ENUM[elecionIndex]][[Constants.PARTIES_ENUM[index]]] = value;
                handleAddHistory({description:"Changed "+Constants.ELECTIONS[elecionIndex]+" "+ Constants.PARTIES[index]
                + " election from " + originalData[Constants.ELECTIONS_ENUM[elecionIndex]][[Constants.PARTIES_ENUM[index]]].toLocaleString() + " to " + value.toLocaleString() + ". "},props.region);
            }
        }
        setRerender(!rerender);
    }

    return (
        <React.Fragment>
            <Divider />
            <h1 className="chartHeader">Election Data</h1>
            <Dropdown
                overlay={
                    <Menu onClick={({ key }) => setSelectedElection(key)}>
                        {
                            Constants.ELECTIONS.map((election) => {
                                return (
                                    <Menu.Item key={election}>
                                        <CalendarOutlined /> {election}
                                    </Menu.Item>
                                );
                            }
                            )
                        }
                    </Menu>
                }
            >
                <div className="electionDiv">
                    <Button
                        type="primary"
                        //icon={<CalendarOutlined />}
                        shape="round"
                        style={{borderRadius: '5px', height: '24.5px', lineHeight: '1em', paddingLeft: '10px', paddingRight: '7px'}}
                    >
                        {selectedElection} <DownOutlined />
                    </Button>
                </div>
            </Dropdown>
            <Popover
                placement="topRight" 
                title={"Source of Data"}
            content=
            {
                selectedState && selectedState.name === "OH" ?
                <>
                    <p>Ohio State of secretary</p>
                    <p>https://www.sos.state.oh.us/elections/election-results-and-data</p>
                </>
                :
                <>
                    <p>Open Elections Project</p>
                    <p>http://openelections.net/</p>
                </>
            }
            >
                <p className="sourceText" style={{marginTop: '-23px'}}><span className="sourceBg">Source of Data</span></p>
            </Popover>
            <br />
            <Slider 
                arrows={false}
                dots={true}
                infinite={true}
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
            >
                <Pie 
                    data={{
                        labels: Constants.PARTIES,
                        datasets: [{
                            data: getData().map(item => item.votes),
                            backgroundColor: [
                                '#36A2EB',
                                '#FF6384',
                                '#B2EB70',
                                '#FFCE56',
                    
                            ],
                            hoverBackgroundColor: [
                                '#36A2EB',
                                '#FF6384',
                                '#B2EB70',
                                '#FFCE56',
                            ]
                        }]
                    }
                    }
                    borderWidth = {100}
                />
                <Table
                    columns={columns}
                    dataSource={getData()}
                    pagination={false}
                    size={'small'}
                />
            </Slider>
        </React.Fragment>
    );
}