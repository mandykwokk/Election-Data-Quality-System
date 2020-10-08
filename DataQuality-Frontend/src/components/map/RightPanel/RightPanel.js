import React, { useContext } from 'react';
import { Layout, Tabs } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import StateContext from 'contexts/StateContext';
import PrecinctTab from './PrecinctTab';
import StateTab from './StateTab';
import DistrictTab from './DistrictTab';
import RerenderContext from 'contexts/RerenderContext';

const { TabPane } = Tabs;

export default function RightPanel(props) {
    const selectedState = useContext(StateContext);
    const [rerender, setRerender] = useContext(RerenderContext);

    return (
        <Layout.Sider
            width={400}
            theme={'light'}
            collapsible={true}
            collapsedWidth={0}
            zeroWidthTriggerStyle={{
                zIndex: 1000,
                borderRadius: '30px 0px 0px 30px'
            }}
            style={{height: '100vh'}}
            reverseArrow
        >
            <h1 className="center sidebarHeader">
                <BarChartOutlined className="sidebarHeader"/> Statistics
            </h1>
            <Tabs type="card" animated={true} onTabClick={() => setRerender(!rerender)}>
                <TabPane tab="State" key="1" disabled={selectedState == null} className="tabpane">
                    {selectedState &&
                        <StateTab />}
                </TabPane>
                <TabPane tab="District" key="2" disabled={props.selectedCd == null} className="tabpane"> 
                    {props.selectedCd &&
                        <DistrictTab selectedCd={props.selectedCd}/>}
                </TabPane>
                <TabPane tab="Precinct" key="3" disabled={props.selectedPrecinct == null} className="tabpane">
                    {props.selectedPrecinct &&
                        <PrecinctTab selectedPrecinct={props.selectedPrecinct} />}
                </TabPane>
            </Tabs>
        </Layout.Sider>
    );
}