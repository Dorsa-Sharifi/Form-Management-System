package org.example.backend.dto;

import java.util.List;

public record ReportRequest(
        List<String> groupBy,
        String target,
        String func,
        String chartType
) {}
