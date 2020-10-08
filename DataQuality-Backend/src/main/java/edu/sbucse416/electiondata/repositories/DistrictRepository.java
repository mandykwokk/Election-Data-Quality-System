package edu.sbucse416.electiondata.repositories;

import edu.sbucse416.electiondata.entities.State;
import org.springframework.data.jpa.repository.JpaRepository;
import edu.sbucse416.electiondata.entities.District;
import java.util.List;

public interface DistrictRepository extends JpaRepository<District, Integer> {

     List<District> findByStateName(String stateName);

     District findByName(String name);

}
