import { COLORS } from 'constants/constants';
import * as Color from 'color';

export default class LayerStyler {

    geoJSONStateStyle() {
        return {
            color: '#4783CC',
            weight: 1,
            fillOpacity: 0.5,
            fillColor: '#B4D5EE'
        }
    }

    geoJSONCdStyle() {
        return {
            color: '#29C2A4',
            weight: 1,
            fillOpacity: 0.2,
            fillColor: '#29C2A4'
        }
    }

    geoJSONPrecinctStyle(precinct, selectedPrecinct) {
        let color = Color.default('#4CAECF');
        let weight = 1;

        if (selectedPrecinct) {
            if (selectedPrecinct.neighbors.includes(precinct.id)) {
                color = Color.default('#FFBEB2');
            }
            if (selectedPrecinct.id === precinct.id) {
                color = Color.default('#FF7B79');
                weight = 3;
            }
        }

        return {
            color: color.darken(0.15),
            weight: weight,
            fillOpacity: 0.5,
            fillColor: color.hex()
        }
    }

    geoJSONNpStyle(feature) {
        return {
            color: '#5DAB21',
            weight: 1,
            fillOpacity: 0.5,
            fillColor: '#A6E378'
        }
    }
}