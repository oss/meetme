import React, { useRef, Fragment } from 'react';
import { DataFrameView, FieldType, PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { MapContainer, TileLayer, useMap, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { FeatureCollection, Polygon } from 'geojson';
import { toNumber } from 'lodash';
import CustomControl, {update_control} from './CustomControl';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import USPanel from './USPanel';

import L from 'leaflet';
const featureCollection: FeatureCollection<Polygon> = require('../static/us-states.json');

interface Props extends PanelProps<SimpleOptions> {}

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
};


const gradient_arr: string[] = (()=>{
    type RGBColor = {
        r: number;
        g: number;
        b: number;
    };

    const colorGradient: string[] = [];

    function interpolateRGB(percent: number) {
        const start: RGBColor = { r: 20, g: 0, b: 0 };  // Dark red as an object
        const end: RGBColor = { r: 255, g: 0, b: 0 };    // Bright red as an object
    
        return {
            r: Math.round(start.r + percent * (end.r - start.r)),
            g: Math.round(start.g + percent * (end.g - start.g)),
            b: Math.round(start.b + percent * (end.b - start.b))
        };
    }

    function intToHex (c: number){
        const hex = c.toString(16);
        if(hex.length === 1){
            return '0' + hex
        }
        return hex;
    };

    for(let i=0;i<100;i++){
        const c = interpolateRGB(i/100);
        colorGradient.push(`#${intToHex(c.r)}${intToHex(c.g)}${intToHex(c.b)}`)
    }
    return colorGradient;
})()

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  //const theme = useTheme2();
    const styles = useStyles2(getStyles);
    const geoJsonRef = useRef();

    const frame = data.series[0];
    const stateField = frame.fields.find((field) => field.type === FieldType.string);
    const valueField = frame.fields.find((field) => field.type === FieldType.number);
    let max_req_count = valueField.values[0]

    const state_map = Object.fromEntries( stateField.values.map((state_abreviation, idx) => { 
        max_req_count = Math.max(max_req_count, valueField.values[idx])
        return [state_abreviation, valueField.values[idx]]
    }));

  return (
    <div
        className={cx(
            styles.wrapper,
            css`
              width: ${width}px;
              height: ${height}px;
              display: flex;
              flex-direction: column;
            `
          )}
    >
        <TabGroup as={Fragment}>
            <TabList>
                <Tab>US Map</Tab>
                <Tab>Global Map</Tab>
            </TabList>
            <TabPanels className={css`display: flex; flex: 1;`}>
                <TabPanel className={css`display: flex; flex: 1;`}>
                    <USPanel state_map={state_map} max_req_count={max_req_count}/>
                </TabPanel>
                <TabPanel>
                    <div>Tab 2</div>
                </TabPanel>
            </TabPanels>
        </TabGroup>
        
    </div>
  );
};

/*
        <MapContainer className={cx(css`flex: 1`)} center={[37.8,-96]} zoom={4} scrollWheelZoom={true}>
            <Force_reload />
            <CustomControl />
            <GeoJSON attribution="&copy; credits due..." data={featureCollection} style={style} onEachFeature={onEachFeature} ref={geoJsonRef}/>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                //url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
            />
        </MapContainer>

*/