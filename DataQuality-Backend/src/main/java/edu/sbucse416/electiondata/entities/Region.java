package edu.sbucse416.electiondata.entities;

import edu.sbucse416.electiondata.entities.converters.DemographicConverter;
import edu.sbucse416.electiondata.entities.converters.ElectionConverter;
import edu.sbucse416.electiondata.enums.DemographicType;
import edu.sbucse416.electiondata.enums.OfficeType;
import edu.sbucse416.electiondata.enums.PartyType;
import edu.sbucse416.electiondata.utils.DemoUtil;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.Map;
import javax.persistence.Convert;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;

@MappedSuperclass
@NoArgsConstructor
@Setter
public abstract class Region {
    private int id;
    private String name;
    private Map<DemographicType, Integer> demographic;
    private Map<OfficeType, Map<PartyType, Integer>> elections;
    private String geometry;

    protected Region(String name, Map<DemographicType, Integer> demographic, String geometry) {
        this.name = name;
        this.demographic = demographic;
        this.geometry = geometry;
    }

    protected Region(String name, Map<DemographicType, Integer> demographic, String geometry,Map<OfficeType, Map<PartyType, Integer>> elections ) {
        this.name = name;
        this.demographic = demographic;
        this.geometry = geometry;
        this.elections = elections;
    }

    @Id
    @GeneratedValue
    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    @Convert(converter = DemographicConverter.class)
    public Map<DemographicType, Integer> getDemographic() {
        return demographic;
    }

    // public Map<ElectionType, Election> getElections() {
    //     return elections;
    // }

    @Convert(converter = ElectionConverter.class)
    public Map<OfficeType, Map<PartyType, Integer>> getElections() { return elections; }

    public String getGeometry() {
        return geometry;
    }

    public void combineDemographic(Map<DemographicType, Integer> demographic){
        this.demographic = DemoUtil.getDemoSum(demographic, this.demographic);
    }

}