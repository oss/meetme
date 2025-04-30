import CustomControl, {update_control} from './CustomControl';
import { MapContainer, TileLayer, useMap, GeoJSON } from 'react-leaflet';
import React, { useRef, Fragment } from 'react';
import { css, cx } from '@emotion/css';
import { DataFrameView, FieldType, PanelProps } from '@grafana/data';

const featureCollection: FeatureCollection<Polygon> = require('../static/us-states.json');


type Props = {
    state_map: any,
    max_req_count: number
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

const USPanel: React.FC<Props> = ({ state_map, max_req_count }) => {
    console.log('sm',max_req_count)
    const geoJsonRef = useRef();

    function style(feature: any) {
        const state_request_count = state_map[feature.properties.name.short]
        const log_val = Math.log(state_request_count) 
        const log_max = Math.log(max_req_count);
        let log_percent = Math.floor(100 * (log_val / log_max))
        if( log_percent === 100)
            log_percent --;

        return {
            fillColor: gradient_arr[log_percent],
            weight: 0.5,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
        };
    }

    function highlightFeature(e){
        const layer = e.target;
        console.log('highlight feature',e.target.feature.properties)

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        layer.bringToFront();
        const state = e.target.feature.properties;
        console.log(state.name, state_map)
        update_control({region: state.name.long, count: state_map[state.name.short] || 0 })
    }

    function resetHighlight(e) {
        geoJsonRef.current.resetStyle(e.target);
        update_control({});
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
        });
    }

    function Force_reload() {
        const map = useMap();
        map.whenReady(()=>{
            map.invalidateSize();
        });
        return null;
    }


    return(
        <div className={cx(css`display: flex; flex: 1`)}>
            <MapContainer className={cx(css`flex: 1`)} center={[37.8,-96]} zoom={4} scrollWheelZoom={true}>
            <Force_reload />
            <CustomControl />
            <GeoJSON attribution="&copy; credits due..." data={featureCollection} style={style} onEachFeature={onEachFeature} ref={geoJsonRef}/>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
            />
            </MapContainer>
        </div>
    )
}

export default USPanel;