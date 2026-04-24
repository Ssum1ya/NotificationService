import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/healthcheck")
public class HealthCheckController {

    @GetMapping()
    public Map<String, String> healthcheck() {
        return Map.of("status", "ok");
    }
}
