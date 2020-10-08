import Axios from 'axios';
export default class HistoryRequester {

    async postHistory(history, precinctId) {
        try {
            const res = await Axios.post(`/history/${precinctId}`, history );
            return res.data;
        }
        catch(error) {
            console.log(error);
            return false;
        }
    }

    async postComment(comment, historyId) {
        try {
            const res = await Axios.post(`/history/comment/${historyId}`, comment );
            return res.data;
        }
        catch(error) {
            console.log(error);
            return false;
        }
    }

    async deleteComment(commentId, historyId) {
        const config = { header: { 'Content-Type': 'application/json' } };
        try {
            await Axios.post(`/history/delete/${historyId}`, {commentId: commentId}, config );
            return true;
        }
        catch(error) {
            console.log(error);
            return false;
        }
    }

    async editComment(content, historyId, commentId) {
        const config = { header: { 'Content-Type': 'application/json' } };
        try {
            await Axios.post(`/history/edit/${historyId}`, {content: content, commentId: commentId}, config );
            return true;
        }
        catch(error) {
            console.log(error);
            return false;
        }
    }
}