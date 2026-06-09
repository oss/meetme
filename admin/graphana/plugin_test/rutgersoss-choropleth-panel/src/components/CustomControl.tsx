import { createControlComponent } from '@react-leaflet/core';
import L from 'leaflet';

const control_wrapper = L.DomUtil.create('div');

const control_wrapper_style = "                         \
    padding: 6px 8px;                                   \
    font: 14px/16px Arial, Helvetica, sans-serif;       \
    background: rgba(26, 26, 26, 0.8);                  \
    box-shadow: 0 0 15px rgba(0,0,0,0.2);               \
    border-radius: 5px;                                 \
"
control_wrapper.style.cssText = control_wrapper_style;

const control_header = document.createElement('h4');
const header_style = "          \
    margin: 0 0 5px;            \
    color: #CCCCCC;             \
    font-size: 12px;            \
"
control_header.style.cssText = header_style
control_header.textContent = "Request Count"

const MyControl = L.Control.extend({
    onAdd: () => {
      update_control({});
      return control_wrapper;
    },

});

const createControlLayer = (props) => {
    // Set up an instance of the control:
    const controlInstance = new MyControl();
    return controlInstance;
};

const update_control = ({region, count}) =>{
    const control_content = [];
    
    const control_body = document.createElement('div')
    control_body.style.cssText = "          \
        font-size: 10px;                    \
    "
    control_body.textContent = region;

    const control_body2 = document.createElement('div')
    control_body2.style.cssText = "          \
        font-size: 10px;                    \
    "
    control_body2.textContent = count;

    control_wrapper.replaceChildren(control_header,control_body,control_body2)

    
    //console.log(<><div>sometext</div></>)
};

// Pass the control instance to the React-Leaflet createControlComponent hook:
const customControl = createControlComponent(createControlLayer);

export { update_control };
export default customControl;
