package com.example.JavaMainService.notifications;

import com.example.JavaMainService.notifications.model.*;
import com.example.JavaMainService.notifications.model.request.NotifyRequestDTO;
import com.example.JavaMainService.userProfile.ProfileJdbcRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final KafkaNotifyProducer kafkaNotifyProducer;
    private final ProfileJdbcRepository profileJdbcRepository;

    private void produceNotification(NotificationDTO notificationMail, NotificationDTO notificationTelegram, NotificationDTO notificationVk) {

        if (!notificationMail.usernameList().isEmpty()) {
            kafkaNotifyProducer.sendNotify(notificationMail, KafkaTopics.emailTopic);
        }

        if (!notificationTelegram.usernameList().isEmpty()) {
            kafkaNotifyProducer.sendNotify(notificationTelegram, KafkaTopics.telegramTopic);
        }

        if (!notificationVk.usernameList().isEmpty()) {
            kafkaNotifyProducer.sendNotify(notificationVk, KafkaTopics.vkTopic);
        }
    }

    public void sendNotificationsToMessengers(NotifyRequestDTO request, String login, String role) {
        ProfileProducerDTO profileProducerDTO = profileJdbcRepository.getProfileFromProducer(login).orElseThrow(() ->
                new RuntimeException("профиль отправителя не найден"));
        if (role.equals("Admin")) {
            profileProducerDTO = new ProfileProducerDTO(profileProducerDTO.userId(), "Admin", "", "");
        }
        List<ConsumerCommunicationDTO> communicationDTOList = profileJdbcRepository.getConsumerCommunication(request.listUserIds());

       handleRequests(profileProducerDTO, communicationDTOList, request.message());
    }

    private void handleRequests(ProfileProducerDTO profileProducerDTO,  List<ConsumerCommunicationDTO> communicationDTOList, String message) {
        List<String> usernamesListMail = communicationDTOList.stream()
                .filter(consumerCommunicationDTO -> consumerCommunicationDTO.communication().equals(Communication.EMAIL))
                .map(ConsumerCommunicationDTO::username).toList();

        List<String> usernamesListTelegram = communicationDTOList.stream()
                .filter(consumerCommunicationDTO -> consumerCommunicationDTO.communication().equals(Communication.TELEGRAM))
                .map(ConsumerCommunicationDTO::username).toList();

        List<String> usernamesListVk = communicationDTOList.stream()
                .filter(consumerCommunicationDTO -> consumerCommunicationDTO.communication().equals(Communication.VK))
                .map(ConsumerCommunicationDTO::username).toList();

        NotificationDTO notificationMail = new NotificationDTO(
                usernamesListMail,
                message,
                profileProducerDTO.fullName(),
                profileProducerDTO.fullPosition(),
                profileProducerDTO.departmentName()
        );
        NotificationDTO notificationTelegram = new NotificationDTO(
                usernamesListTelegram,
                message,
                profileProducerDTO.fullName(),
                profileProducerDTO.fullPosition(),
                profileProducerDTO.departmentName()

        );
        NotificationDTO notificationVk = new NotificationDTO(
                usernamesListVk,
                message,
                profileProducerDTO.fullName(),
                profileProducerDTO.fullPosition(),
                profileProducerDTO.departmentName()
        );

        produceNotification(notificationMail, notificationTelegram, notificationVk);
    }
}
