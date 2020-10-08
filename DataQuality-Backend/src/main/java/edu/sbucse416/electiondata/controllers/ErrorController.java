package edu.sbucse416.electiondata.controllers;

import edu.sbucse416.electiondata.services.ErrorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/error")
public class ErrorController {

    @Autowired
    private ErrorService errorService;

    @PostMapping("/{id}")
    public ResponseEntity resolveError(@PathVariable int id) {
        errorService.removeErrorById(id);
        return new ResponseEntity<>(new HttpHeaders(), HttpStatus.OK);
    }

}