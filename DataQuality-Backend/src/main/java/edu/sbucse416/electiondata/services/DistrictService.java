package edu.sbucse416.electiondata.services;

import edu.sbucse416.electiondata.entities.District;

import edu.sbucse416.electiondata.repositories.DistrictRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DistrictService {

    @Autowired
    private DistrictRepository districtRepo;

    public List<District> getDistrictsByStateName(String stateName) {
        return districtRepo.findByStateName(stateName);
    }

    public District getDistrictByName(String districtName) {
        return districtRepo.findByName(districtName);
    }

    public void saveDistrict(District district) {
        districtRepo.save(district);
    }

}
