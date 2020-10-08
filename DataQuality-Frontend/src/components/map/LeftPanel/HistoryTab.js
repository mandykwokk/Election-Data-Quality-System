import React, { useState } from 'react';
import moment from 'moment';
import { Collapse, List, Badge, Select, Space, Timeline } from 'antd';
import { CommentOutlined, ZoomInOutlined } from '@ant-design/icons';
import * as Constants from 'constants/constants';

const { Panel } = Collapse;
const { Option } = Select;

export default function HistoryTab(props) {

    const [selected, setSelected] = useState("error");
    function handleChange(value){
        setSelected(value);
    }

    return (
        <>
         <Space style={{ marginBottom: 16 }}>
          View By：
            <Select defaultValue="error" style={{ width: 180 }} onChange={handleChange}>
                <Option value="error">Error Categories</Option>
                <Option value="precinct">Precincts</Option>
            </Select>
        </Space>

        {
            selected === "error"
            ?
            <Collapse>
                    {Constants.ERROR_HEADER.map((item, index) => (
                        <Panel 
                            header={item}
                            key= {index}
                        >
                            <List
                                dataSource={props.histories[index]}
                                renderItem={item => (
                                <List.Item className="inner-collapse">
                                    <Collapse>
                                        <Panel
                                            header={item[0].precinct.name}
                                            extra={
                                                <React.Fragment>
                                                    <ZoomInOutlined
                                                            onClick={() => props.handleZoomInPrecinct(item[0].precinct, item[1])} 
                                                            style={{fontSize: '22px', color: "#4c9def", paddingRight: "5px"}}
                                                            title="Fix"
                                                        />
                                                    <Badge
                                                        count={item[0].comments.length}
                                                        showZero
                                                        dot={false}
                                                    >
                                                        <CommentOutlined 
                                                            style={{fontSize: '22px', color: "black", paddingRight: "5px"}}
                                                            title="View comments"
                                                            onClick={() => props.handleOpenCommentTab(item[0])}
                                                        />
                                                    </Badge>
                                                </React.Fragment>
                                            }
                                        >
                                            <p>{item[0].description}</p>
                                            <p className="timestamp">{(moment(item[0].timestamp).format("MM-DD-YYYY HH:mm:ss"))}</p>
                                        </Panel>
                                        
                                    </Collapse>
                                </List.Item>
                                )}
                            />
                        </Panel>
                    ))
                    }
            </Collapse>
            :
            <List
                dataSource={props.precincts.filter(item => item.histories.length !== 0)}
                renderItem={item => (
                    <List.Item className="inner-collapse">
                        <Collapse>
                            <Panel
                                header={item.name}
                            >
                            <Timeline reverse>
                            {
                                item.histories.map((history, index) => {
                                    return (
                                        <Timeline.Item
                                            key={index}
                                            color = {history.category ? "green" : "blue"}
                                        >
                                            <p>{history.description}</p>
                                            <p className="timestamp">{(moment(history.timestamp).format("MM-DD-YYYY HH:mm:ss"))} 
                                            &nbsp;&nbsp;
                                            <Badge
                                                count={history.comments.length}
                                                showZero
                                                dot={false}
                                            >
                                            <CommentOutlined 
                                                style={{fontSize: '22px', color: "black", paddingRight: "5px"}}
                                                title="View comments"
                                                onClick={() => props.handleOpenCommentTab(history)}
                                            /></Badge></p>
                                        </Timeline.Item>
                                    );
                                })
                            }
                            </Timeline>
                                
                            </Panel>
                        </Collapse>
                    </List.Item>
                )}
            />
            }
        </>
    );
}