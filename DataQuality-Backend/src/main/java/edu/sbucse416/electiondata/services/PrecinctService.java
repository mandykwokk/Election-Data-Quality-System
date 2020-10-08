package edu.sbucse416.electiondata.services;

import edu.sbucse416.electiondata.entities.Precinct;
import edu.sbucse416.electiondata.repositories.PrecinctRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrecinctService {

    @Autowired
    private PrecinctRepository precinctRepo;

    public Precinct getPrecinctById(int id) {
        return precinctRepo.findById(id).orElse(null);
    }

    public List<Precinct> getPrecinctsByDistrict(String district) {
        return precinctRepo.findByDistrictName(district);
    }

    public Precinct savePrecinct(Precinct precinct) {
        return precinctRepo.save(precinct);
    }

    public void deletePrecinct(Precinct precinct) { precinctRepo.delete(precinct); }

}