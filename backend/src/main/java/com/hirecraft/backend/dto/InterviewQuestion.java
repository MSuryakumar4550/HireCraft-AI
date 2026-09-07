package com.hirecraft.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class InterviewQuestion {
    private String id;
    private String question;
    private String subject;
    private String topic;
    private String difficulty;
    private String type;
    private List<String> concepts;
    private List<String> criteria;

    @JsonProperty("follow_up")
    @JsonAlias({"followUp", "follow_up"})
    private Boolean followUp;
}

