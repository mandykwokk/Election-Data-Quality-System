import React, { useContext } from 'react';
import { Layout, Tabs } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import DistrictContext from 'contexts/DistrictContext';
import ErrorsTab from './ErrorsTab';
import HistoryTab from './HistoryTab';

const { TabPane } = Tabs;

export default function LeftPanel(props) {
    const selectedCd = useContext(DistrictContext);
    return (
        <Layout.Sider
            width={350}
            theme={'light'}
            collapsible={true}
            collapsedWidth={0}
            zeroWidthTriggerStyle={{
                zIndex: 1000,
                borderRadius: '0px 30px 30px 0px'
            }}
            style={{height: '100vh'}}
        >
            <h1 className="center sidebarHeader">
                <UserOutlined className="sidebarHeader"/> User Corrections
            </h1>
            <Tabs type="card" animated={true}>
                <TabPane tab="Identified Errors" key="1" disabled={!selectedCd} className="outer-tab">
                    {selectedCd && 
                        <ErrorsTab 
                            errors={props.errors} 
                            handleZoomInPrecinct={props.handleZoomInPrecinct} 
                            handleResolvedError={props.handleResolvedError}
                        />
                    }
                </TabPane>
                <TabPane tab="Corrections Log" key="2" disabled={!selectedCd} className="outer-tab">
                    {selectedCd &&
                        <HistoryTab
                            histories = {props.history}
                            precincts = {props.precincts}
                            handleZoomInPrecinct={props.handleZoomInPrecinct}
                            handleAddComment = {props.handleAddComment}
                            handleOpenCommentTab={props.handleOpenCommentTab}
                        />
                    }
                </TabPane>
            </Tabs>
        </Layout.Sider>
    );
}
