package edu.sbucse416.electiondata.repositories;

import edu.sbucse416.electiondata.entities.Precinct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrecinctRepository extends JpaRepository<Precinct, Integer> {

    List<Precinct> findByDistrictName(String district);


}