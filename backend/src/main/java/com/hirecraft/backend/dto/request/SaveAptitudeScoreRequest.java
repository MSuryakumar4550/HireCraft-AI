package com.hirecraft.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveAptitudeScoreRequest {

    @NotNull
    private Integer score;

    @NotNull
    private Integer totalQuestions;

    @NotNull
    private BigDecimal accuracy;

}
