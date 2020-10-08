package edu.sbucse416.electiondata.controllers;

import edu.sbucse416.electiondata.entities.District;
import edu.sbucse416.electiondata.entities.History;
import edu.sbucse416.electiondata.entities.Precinct;
import edu.sbucse416.electiondata.entities.State;
import edu.sbucse416.electiondata.entities.Error;
import edu.sbucse416.electiondata.enums.DemographicType;
import edu.sbucse416.electiondata.enums.OfficeType;
import edu.sbucse416.electiondata.enums.PartyType;
import edu.sbucse416.electiondata.services.DistrictService;
import edu.sbucse416.electiondata.services.PrecinctService;
import edu.sbucse416.electiondata.services.StateService;
import edu.sbucse416.electiondata.services.ErrorService;
import edu.sbucse416.electiondata.services.HistoryService;
import edu.sbucse416.electiondata.utils.DemoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/precinct")
public class PrecinctController {

    @Autowired
    private PrecinctService precinctService;
    @Autowired
    private DistrictService districtService;
    @Autowired
    private StateService stateService;
    @Autowired
    private ErrorService errorService;
    @Autowired
    private HistoryService historyService;

    @PostMapping("/{precinctId}/name")
    public ResponseEntity updateName(@PathVariable int precinctId, @RequestBody Map<String,String> data){
        Precinct precinct = precinctService.getPrecinctById((precinctId));
        precinct.setName(data.get("name"));
        precinctService.savePrecinct(precinct);
        return new ResponseEntity<>(new HttpHeaders(), HttpStatus.OK);
    }

    @PostMapping("/generate")
    public ResponseEntity<Integer> addPrecinct(@RequestBody Precinct precinct) {
        precinct = precinctService.savePrecinct(precinct);
        return new ResponseEntity<>(precinct.getId(), new HttpHeaders(), HttpStatus.OK);
    }

    @GetMapping("/{district}")
    public ResponseEntity<List<Precinct>> getPrecinct(@PathVariable String district) {
        List<Precinct> precincts = precinctService.getPrecinctsByDistrict(district);
        return new ResponseEntity<>(precincts, new HttpHeaders(), HttpStatus.OK);
    }

    @PostMapping("/demo/{precinctId}")
    public ResponseEntity updateDemographic(@PathVariable int precinctId, @RequestBody Map<DemographicType, Integer> demographic) {
        Precinct precinct = precinctService.getPrecinctById(precinctId);
        Map<DemographicType, Integer> diff = DemoUtil.getDemoDifference(demographic, precinct.getDemographic());

        precinct.setDemographic(demographic);
        precinctService.savePrecinct(precinct);

        District district = districtService.getDistrictByName(precinct.getDistrictName());
        district.combineDemographic(diff);
        districtService.saveDistrict(district);

        State state = stateService.getStateByName(precinct.getStateName());
        state.combineDemographic(diff);
        stateService.saveState(state);

        return new ResponseEntity<>(new HttpHeaders(), HttpStatus.OK);
    }

    @PostMapping("/{precinctId}/neighbor")
    public ResponseEntity updateNeighbor(@PathVariable int precinctId, @RequestBody Map<String,Integer> data) {
        Precinct precinct = precinctService.getPrecinctById(precinctId);
        Precinct targetPrecinct = precinctService.getPrecinctById(data.get("targetPrecinctId"));
        Set<Integer> neighbors = precinct.getNeighbors();
        Set<Integer> targetNeighbors = targetPrecinct.getNeighbors();

        if(data.get("toAdd")==1) {
            neighbors.add(data.get("targetPrecinctId"));
            targetNeighbors.add(precinctId);
        }
        else{
            neighbors.remove(data.get("targetPrecinctId"));
            targetNeighbors.remove(precinctId);
        }
        precinct.setNeighbors(neighbors);
        targetPrecinct.setNeighbors(targetNeighbors);

        precinctService.savePrecinct(precinct);
        precinctService.savePrecinct(targetPrecinct);

        return new ResponseEntity<>(new HttpHeaders(), HttpStatus.OK);
    }

    @PostMapping("/{precinctId}/ghost")
    public ResponseEntity updateGhost(@PathVariable int precinctId){
        Precinct precinct = precinctService.getPrecinctById((precinctId));
        precinct.setGhost(true);
        precinct.setName(precinct.getName().substring(precinct.getName().indexOf(" ")+1));
        precinctService.savePrecinct(precinct);
        return new ResponseEntity<>(new HttpHeaders(), HttpStatus.OK);
    }

    @PostMapping("/{precinctId}/boundary")
    public ResponseEntity updateBoundary(@PathVariable int precinctId, @RequestBody Map<String,String> payload){
        Precinct precinct = precinctService.getPrecinctById(precinctId);
        precinct.setGeometry(payload.get("geojson"));
        precinctService.savePrecinct(precinct);
        return new ResponseEntity<>(new HttpHeaders(), HttpStatus.OK);
    }

    @PostMapping("/election/{precinctId}")
    public ResponseEntity updateElection(@PathVariable int precinctId, @RequestBody Map<String, Map<OfficeType, Map<PartyType, Integer>>> data) {
        Precinct precinct = precinctService.getPrecinctById(precinctId);
        precinct.setElections(data.get("electionJson"));
        precinctService.savePrecinct(precinct);
        District district = districtService.getDistrictByName(precinct.getDistrictName());
        district.setElections(data.get("districtElectionJson"));

        State state = stateService.getStateByName(precinct.getStateName());
        state.setElections(data.get("stateElectionJson"));

        districtService.saveDistrict(district);
        stateService.saveState(state);

        return new ResponseEntity<>(new HttpHeaders(), HttpStatus.OK);
    }

    @PostMapping("/merge")
    public ResponseEntity<Precinct> mergePrecinct(@RequestBody Map<String, Object> body) {
        Precinct selectedPrecinct = precinctService.getPrecinctById((int)body.get("selectedId"));
        Precinct clickedPrecinct = precinctService.getPrecinctById((int)body.get("clickedId"));
        selectedPrecinct.setGeometry((String)(body.get("geometry")));
        clickedPrecinct.setGeometry(null);

        selectedPrecinct.combineDemographic(clickedPrecinct.getDemographic());

        for (OfficeType type : OfficeType.values()) {
            for (PartyType party: PartyType.values()) {
                selectedPrecinct.getElections().get(type).put(
                        party,
                        selectedPrecinct.getElections().get(type).get(party) + clickedPrecinct.getElections().get(type).get(party)
                );
            }
        }

        selectedPrecinct.getNeighbors().addAll(clickedPrecinct.getNeighbors());
        selectedPrecinct.getHistories().addAll(clickedPrecinct.getHistories());
        selectedPrecinct.getErrors().addAll(clickedPrecinct.getErrors());
        clickedPrecinct.getHistories().clear();
        clickedPrecinct.getErrors().clear();
        Precinct savedPrecinct = precinctService.savePrecinct(selectedPrecinct);
        precinctService.savePrecinct(clickedPrecinct);

        return new ResponseEntity<>(savedPrecinct, new HttpHeaders(), HttpStatus.OK);
    }
}