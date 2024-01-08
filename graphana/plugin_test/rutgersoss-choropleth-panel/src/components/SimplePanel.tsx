import React, { useRef } from 'react';
import { DataFrameView, FieldType, PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { MapContainer, TileLayer, useMap, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { FeatureCollection, Polygon } from 'geojson';
import { toNumber } from 'lodash';
import CustomControl, {update_control} from './CustomControl';
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

    const state_map = {}
    let max_count = valueField.values[0];
    for(let i=0;i<stateField.values.length;i++){
        const state_abreviation = stateField.values[i]
        let state_request_count = valueField.values[i]
        
        //for testing purposes
        state_request_count = Math.floor(Math.abs(state_request_count * Math.random() * 1000))
        
        state_map[state_abreviation] = state_request_count

        if(max_count < state_request_count){
            max_count = state_request_count
        }
    }

    React.useEffect(() => {        
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
          iconUrl: require("leaflet/dist/images/marker-icon.png"),
          shadowUrl: require("leaflet/dist/images/marker-shadow.png")
        });        
    }, []);

    function Force_reload() {
        const map = useMap();
        map.whenReady(()=>{
            map.invalidateSize();
        });
        return null;
    }

    function style(feature: any) {
        const state_request_count = state_map[feature.properties.name.short]
        const log_val = Math.log(state_request_count) 
        const log_max = Math.log(max_count);
        let log_percent = Math.floor(100 * (log_val / log_max))
        if( log_percent === 100)
            log_percent --;

        console.log('color',state_request_count,gradient_arr, log_percent,log_val , log_max)

        return {
            fillColor: gradient_arr[log_percent],
            weight: 0.5,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
        };
    }

    
    function print_data(){
        const view = new DataFrameView(frame);
        console.log(stateField,valueField);
        console.log(view);
        return <></>;
    }

    function highlightFeature(e){
        console.log(e)
        const layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        layer.bringToFront();
        const view = new DataFrameView(frame);
        console.log(stateField,valueField);
        console.log(view);
        console.log(e);
        const state = e.target.feature.properties;
        console.log("count",state_map)
        update_control({region: state.name.long, count: state_map[state.name.short]})
    }

    function resetHighlight(e) {
        console.log(e)
        //l.resetStyle(f)
        geoJsonRef.current.resetStyle(e.target);
        update_control({});
    }

        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
            });
        }
    
      
  return (
    <div
        className={cx(
            styles.wrapper,
            css`
              width: ${width}px;
              height: ${height}px;
              display: flex
            `
          )}
    >
        <div className={styles.textBox}>
            <div>Text option value: {options.text}</div>
            <div>
                {print_data()}
            </div>
        </div>
      <MapContainer className={cx(css`
        flex: 1
      `)} center={[37.8,-96]} zoom={4} scrollWheelZoom={true}>
            <Force_reload />
            <CustomControl />
            <GeoJSON attribution="&copy; credits due..." data={featureCollection} style={style} onEachFeature={onEachFeature} ref={geoJsonRef}/>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                //url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
            />
        </MapContainer>
    </div>
  );
};