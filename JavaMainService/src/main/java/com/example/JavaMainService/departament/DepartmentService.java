package com.example.JavaMainService.departament;

import com.example.JavaMainService.departament.model.request.CreateDepDTO;
import com.example.JavaMainService.departament.model.response.GetDepartamentAllDTO;
import com.example.JavaMainService.user.User;
import com.example.JavaMainService.userProfile.Profile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

@Service
@RequiredArgsConstructor
public class DepartamentService {
    private final DepartamentRepository departamentRepository;

    public void createDep(CreateDepDTO request) {
        Optional<Departament> findByName = departamentRepository.findByName(request.name());

        if (findByName.isPresent()) {
            throw new IllegalArgumentException("Такое имя уже есть");
        }

        departamentRepository.save(new Departament(request.name()));
    }

    public List<GetDepartamentAllDTO> getAll() {
        List<Departament> departaments = departamentRepository.getAllDepartaments();
        List<GetDepartamentAllDTO> answer = departaments.stream()
                .map(d -> {
                    String headName = "";

                    User head = d.getHead();
                    if (head != null) {
                        Profile headProfile = head.getProfile();
                        if (headProfile != null) {
                            headName = headProfile.getLastName() + " " + headProfile.getName();
                        }
                    }

                    AtomicReference<Integer> size = new AtomicReference<>(0);

                    d.getEmployees().stream().forEach(
                            p -> {
                                if (p.getUser().getGetIsEnableAdmin() && p.getUser().getRequestStatusHead()) {
                                    size.updateAndGet(v -> v + 1);
                                }
                            }
                    );

                    return new GetDepartamentAllDTO(
                      d.getId(),
                      d.getName(),
                      headName,
                            size.get()
                    );
                }).toList();

        return answer;
    }

    public List<String> user_select() {
        return departamentRepository.findAll()
                .stream().map(Departament::getName).toList();
    }
}
