package edu.sbucse416.electiondata.services;

import edu.sbucse416.electiondata.entities.State;
import edu.sbucse416.electiondata.repositories.StateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StateService {

    @Autowired
    private StateRepository stateRepo;

    public List<State> getStates() {
        return stateRepo.findAll();
    }

    public State getStateByName(String stateName) {
        return stateRepo.findByName(stateName);
    }

    public void saveState(State state) {
        stateRepo.save(state);
    }
}