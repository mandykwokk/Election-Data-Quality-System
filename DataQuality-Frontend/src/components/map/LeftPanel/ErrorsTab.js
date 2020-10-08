import React from 'react';
import { Collapse, List, Popover, Popconfirm } from 'antd';
import { QuestionCircleOutlined, ZoomInOutlined, CheckCircleOutlined } from '@ant-design/icons';
import * as Constants from 'constants/constants';

const { Panel } = Collapse;

export default function ErrorsTab(props) {
    return (
        <Collapse>
                {Constants.ERROR_HEADER.map((item, index) => (
                    <Panel 
                        header={item}
                        key= {index}
                        extra={
                            <Popover 
                                placement="bottom"
                                title={item}
                                content={
                                    <p style={{width: "250px"}}>
                                        {Constants.ERROR_HINTS[index]}
                                    </p>
                                }
                            >
                                <QuestionCircleOutlined style={{fontSize: "22px"}}/>
                            </Popover>
                        }
                    >
                        <List
                            dataSource={props.errors[index]}
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
                                                <Popconfirm 
                                                    title="Are you sure to resolve this error?"
                                                    onConfirm={() => props.handleResolvedError(item[0], index, item[1])}
                                                    okText="Yes"
                                                    cancelText="No"
                                                >
                                                    <CheckCircleOutlined
                                                        style={{fontSize: '22px', color: "#7dbe7b"}}
                                                        title="Resolve error"
                                                    />
                                                </Popconfirm>
                                            </React.Fragment>
                                        }
                                    >
                                        <p>{item[0].description}</p>
                                    </Panel>
                                    
                                </Collapse>
                            </List.Item>
                            )}
                        />
                    </Panel>
                ))
                }
        </Collapse>
    );
}