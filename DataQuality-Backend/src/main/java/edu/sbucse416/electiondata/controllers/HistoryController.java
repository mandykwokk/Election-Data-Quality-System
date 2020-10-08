package edu.sbucse416.electiondata.controllers;

import edu.sbucse416.electiondata.entities.Comment;
import edu.sbucse416.electiondata.entities.History;
import edu.sbucse416.electiondata.entities.Precinct;
import edu.sbucse416.electiondata.services.HistoryService;
import edu.sbucse416.electiondata.services.PrecinctService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/history")
public class HistoryController {

    @Autowired
    private HistoryService historyService;
    @Autowired
    private PrecinctService precinctService;

    @PostMapping("/{precinctId}")
    public ResponseEntity<Integer> addHistory(@PathVariable int precinctId, @RequestBody History history) {
        Precinct precinct = precinctService.getPrecinctById(precinctId);
        precinct.getHistories().add(history);
        history.setPrecinct(precinct);
        precinctService.savePrecinct(precinct);
        return new ResponseEntity<>(precinct.getHistories().get(precinct.getHistories().size() -1).getId(), new HttpHeaders(), HttpStatus.OK);
    }

    @PostMapping("/comment/{historyId}")
    public ResponseEntity<Integer> addComment(@PathVariable int historyId, @RequestBody Comment comment) {
        History history = historyService.getHistoryById(historyId);
        history.getComments().add(comment);
        comment.setHistory(history);
        historyService.saveHistory(history);
        return new ResponseEntity<>(history.getComments().get(history.getComments().size() -1).getId(), new HttpHeaders(), HttpStatus.OK);
    }

    @PostMapping("/delete/{historyId}")
    public ResponseEntity deleteComment(@PathVariable int historyId, @RequestBody Map<String, Integer> payload) {
        int commentId = payload.get("commentId");
        History history = historyService.getHistoryById(historyId);
        history.getComments().removeIf(e -> e.getId() == commentId);

        historyService.saveHistory(history);
        return new ResponseEntity<>(new HttpHeaders(), HttpStatus.OK);
    }

    @PostMapping("/edit/{historyId}")
    public ResponseEntity editComment(@PathVariable int historyId, @RequestBody Map<String, Object> payload) {
        String content = (String) payload.get("content");
        int commentId = (Integer) payload.get("commentId");
        History history = historyService.getHistoryById(historyId);
        history.getComments().forEach(comment -> {
            if(comment.getId() == commentId) {
                comment.setContent(content);
            }
        });
        historyService.saveHistory(history);
        return new ResponseEntity<>(new HttpHeaders(), HttpStatus.OK);
    }

}