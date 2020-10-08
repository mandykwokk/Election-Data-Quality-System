import Axios from 'axios';

export default class PrecinctRequester {

    async updateName(precinctId, newName) {
        const config = { header: { 'Content-Type': 'application/json' } };
        try {
            await Axios.post(`/precinct/${precinctId}/name`, { name : newName}, config);
            return true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }

    async addNewPrecinct(precinct) {
        try {
            let res = await Axios.post(`/precinct/generate`, precinct);
            return res.data;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }

    async updateDemographic(precinctId, demographic) {
        try {
            await Axios.post(`/precinct/demo/${precinctId}`, demographic);
            return true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }

    async updateGhostPrecinct(precinctId) {
        try {
            await Axios.post(`/precinct/${precinctId}/ghost`);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async updateBoundary(precinctId, newBoundary) {
        const config = { header: { 'Content-Type': 'application/json' } };
        try {
            await Axios.post(`/precinct/${precinctId}/boundary`, { geojson: newBoundary }, config);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    
    async updateNeighbor(precinctId, targetId, addingNeighbor) {
        try {
            let add;
            if(addingNeighbor)
                add = 1;
            else
                add = 0;
            await Axios.post(`/precinct/${precinctId}/neighbor`, {targetPrecinctId: targetId, toAdd: add});
            return true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }

    async updateElection(precinctId, electionJson, districtElectionJson, stateElectionJson) {
        try {
            await Axios.post(`/precinct/election/${precinctId}`, {electionJson: electionJson, districtElectionJson:districtElectionJson, stateElectionJson: stateElectionJson});
            return true;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }

    async mergePrecincts(body) {
        const config = { header: { 'Content-Type': 'application/json' } };
        try {
            const res = await Axios.post(`/precinct/merge`, body, config);
            return res.data;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}