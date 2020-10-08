import Axios from 'axios';

export default class ErrorDataRequester {
    async ResolveError(id) {
        try {
            await Axios.post(`/error/${id}`);
            return true;
        }
        catch(error) {
            console.log(error);
            return false;
        }
    }

}