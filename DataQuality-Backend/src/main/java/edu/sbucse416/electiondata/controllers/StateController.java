package edu.sbucse416.electiondata.controllers;

import edu.sbucse416.electiondata.entities.State;
import edu.sbucse416.electiondata.services.StateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/state")
public class StateController {

    @Autowired
    private StateService stateService;

    @GetMapping
    public ResponseEntity<List<State>> getStates() {
        List<State> states = stateService.getStates();
        return new ResponseEntity<>(states, new HttpHeaders(), HttpStatus.OK);
    }

}