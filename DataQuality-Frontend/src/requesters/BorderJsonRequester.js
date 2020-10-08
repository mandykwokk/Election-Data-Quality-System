import Axios from 'axios';
import * as Constants from 'constants/constants';

export default class BorderJsonRequester {
    async getStateBorders() {
        let res = await Axios.get(`state`);
        res.data.forEach(d => {
            d.type = "Feature";
            d.geometry = JSON.parse(d.geometry);
        });
        return res.data;
    }

    async getCdBorders() {

        try {
            const axioRequests = Constants.STATES.map(state => {
                return Axios.get(`/district/${state}`);
            });
            let res = await Axios.all(axioRequests);
            res = res.map(data => {
                data.data.forEach(d => {
                    d.type = "Feature";
                    d.geometry = JSON.parse(d.geometry);
                })
                return data.data;
            });
            return res;
        } catch (error) {
            console.log(error);
        }

    }

    async getPrecinctBorder(district) {
        try {
            const res = await Axios.get(`/precinct/${district}`);
            res.data.forEach((d) => {
                d.type = "Feature";
                d.geometry = JSON.parse(d.geometry);
                d.originalGeometry = JSON.parse(d.originalGeometry);
                d.histories.forEach(history => {
                    history.comments = history.comments.reverse();
                })
            });
            return res.data;
        } catch (error) {
            console.log(error);
        }
    }

    async getNpBorders() {
        const res = await Axios.get('/data/np/np.geojson', { baseURL: "" });
        return res.data;
    }
}