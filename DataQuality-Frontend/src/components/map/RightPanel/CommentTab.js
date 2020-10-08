import React, { useState, useRef } from 'react';
import { Comment, Avatar, Form, Button, List, Input, Tooltip, Drawer, message } from 'antd';
import { UserOutlined, CommentOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import HistoryRequester from 'requesters/HistoryRequester';

const { TextArea } = Input;
const historyRequester = new HistoryRequester();

export default function CommentTab(props) {

    const [rerender, setRerender] = useState(false);
    const [editingid, setEditingid] = useState(null);
    const textareaRef = useRef(null);

    async function handleSubmitComment(values) {
        let comment = {content: values['comment']};
        let res;
        comment.timestamp = moment();
        if ((res = await historyRequester.postComment(comment, props.selectedHistory.id))) {
            message.success ("Successfuly added comment.");
            comment.id = res;
            props.selectedHistory.comments.unshift(comment);
            setRerender(!rerender);
        }
        else {
            message.error ("Failed to add comment.")
        }
    }

    async function handleDeleteComment(commentId) {
        if (await historyRequester.deleteComment(commentId, props.selectedHistory.id)) {
            message.success ("Successfuly deleted comment.");
            props.selectedHistory.comments = props.selectedHistory.comments.filter(item => { 
                return item.id !== commentId;
            });
            setRerender(!rerender);
        }
        else {
            message.error ("Failed to delete comment.")
        }
    }

    function handleClickEditButton(commentId) {
        setEditingid(commentId);
    }

    function handleCancelEdit() {
        setEditingid(null);
    }

    async function handleSaveEdit() {
        const comment = textareaRef.current.state.value;
        if (await historyRequester.editComment(comment, props.selectedHistory.id, editingid)) {
            message.success ("Successfuly edited comment.");
            props.selectedHistory.comments.forEach(element => {
                if (element.id === editingid)
                    element.content = comment;
            });
        }
        else {
            message.error ("Failed to add comment.")
        }
        setEditingid(null);
    }

    if (!props.selectedHistory) {
        return <React.Fragment />;
    }
    

    return (
        <Drawer
            title="Comments"
            placement="right"
            closable={true}
            onClose={props.handleCloseCommentTab}
            visible={props.showCommentTab}
            width={500}
        >
        <React.Fragment>
            <div>
                <Form onFinish={handleSubmitComment}>
                    <h1><CommentOutlined /> Comments</h1>
                    <Form.Item name="comment">
                        <TextArea rows={4} placeholder={"Enter your comment"} />
                    </Form.Item>
                    <Form.Item>
                        <Button htmlType="submit" type="primary">
                            Add Comment
                        </Button>
                    </Form.Item>
                </Form>
                <List
                    dataSource={props.selectedHistory.comments}
                    header={props.selectedHistory.comments
                                ? `${props.selectedHistory.comments.length} comments`
                                : `0 comment`}
                    itemLayout="horizontal"
                    renderItem={(item, index) => 
                        <Comment
                            key={index}
                            avatar={<Avatar icon={<UserOutlined />} />}
                            content=
                            {
                                item.id === editingid
                                ?
                                <React.Fragment>
                                    <TextArea rows={2} ref={textareaRef} defaultValue={item.content} />
                                </React.Fragment>
                                :
                                item.content
                            }
                            actions={
                                [
                                    !editingid ?
                                    <React.Fragment>
                                        <span key="edit">
                                        <span onClick= {() => handleClickEditButton(item.id)}><EditOutlined />Edit</span>
                                        </span>
                                        <span key="delete">
                                        <span onClick= {() => handleDeleteComment(item.id)}><DeleteOutlined />Delete</span>
                                        </span>
                                    </React.Fragment>
                                    :
                                    <React.Fragment>
                                        <span key="save">
                                        <span onClick= {handleSaveEdit}><EditOutlined />Save</span>
                                        </span>
                                        <span key="cancel">
                                        <span onClick= {handleCancelEdit}><DeleteOutlined />Cancel</span>
                                        </span>
                                    </React.Fragment>
                                ]
                            }
                            datetime={ 
                                <Tooltip title={moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}>
                                    <span>{moment(item.timestamp).fromNow()}</span>
                                </Tooltip>
                            }
                        />
                    }
                />
            </div>
        </React.Fragment>
        </Drawer>
    );
}