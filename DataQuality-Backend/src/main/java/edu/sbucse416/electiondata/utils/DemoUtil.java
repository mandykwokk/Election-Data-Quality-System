package edu.sbucse416.electiondata.utils;

import edu.sbucse416.electiondata.enums.DemographicType;

import java.util.Map;
import java.util.stream.Collectors;

public class DemoUtil {

    public static Map<DemographicType, Integer> getDemoDifference(
        Map<DemographicType, Integer> originalDemo,
        Map<DemographicType, Integer> newDemo
    ) {
        Map<DemographicType, Integer> diff = originalDemo.entrySet()
                .stream()
                .collect(Collectors.toMap(e -> e.getKey(), e -> e.getValue() - newDemo.get(e.getKey())));
        return diff;
    }

    public static Map<DemographicType, Integer> getDemoSum(
        Map<DemographicType, Integer> originalDemo,
        Map<DemographicType, Integer> newDemo
    ) {
        Map<DemographicType, Integer> sum = originalDemo.entrySet()
                .stream()
                .collect(Collectors.toMap(e -> e.getKey(), e -> e.getValue() + newDemo.get(e.getKey())));
        return sum;
    }
}
