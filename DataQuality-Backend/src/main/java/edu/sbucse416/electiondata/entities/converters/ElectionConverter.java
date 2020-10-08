package edu.sbucse416.electiondata.entities.converters;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import edu.sbucse416.electiondata.enums.DemographicType;
import edu.sbucse416.electiondata.enums.OfficeType;
import edu.sbucse416.electiondata.enums.PartyType;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@Converter
@Log4j2
public class ElectionConverter implements AttributeConverter<Map<OfficeType, Map<PartyType, Integer>>, String> {

    @Autowired
    private ObjectMapper mapper;

    @Override
    public String convertToDatabaseColumn(Map<OfficeType, Map<PartyType, Integer>> election) {
        if (election == null)
            return null;
        try {
            return mapper.writeValueAsString(election);
        }
        catch (IOException e) {
            log.error("Fail to serialize demographic data.");
            return null;
        }
    }

    @Override
    public Map<OfficeType, Map<PartyType, Integer>> convertToEntityAttribute(String jsonString) {
        if (jsonString == null) {
            return null;
        }

        TypeReference<LinkedHashMap<OfficeType, Map<PartyType, Integer>>> typeRef = new  TypeReference<LinkedHashMap<OfficeType, Map<PartyType, Integer>>>() {};
        try {
            return mapper.readValue(jsonString, typeRef);
        } catch (IOException e) {
            log.error("Fail to deserialize demographic data.");
            return null;
        }
    }
}
