package edu.sbucse416.electiondata.controllers;

import edu.sbucse416.electiondata.entities.District;
import edu.sbucse416.electiondata.services.DistrictService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/district")
public class DistrictController {

    @Autowired
    private DistrictService districtService;

    @GetMapping("/{state}")
    public ResponseEntity<List<District>> getDistrict(@PathVariable String state) {
        List<District> districts = districtService.getDistrictsByStateName(state);
        return new ResponseEntity<>(districts, new HttpHeaders(), HttpStatus.OK);
    }

}
