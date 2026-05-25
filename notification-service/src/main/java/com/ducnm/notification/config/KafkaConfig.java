package com.ducnm.notification.config;

import com.ducnm.common.event.BookingConfirmedEvent;
import com.ducnm.common.event.BookingCreatedEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.util.backoff.ExponentialBackOff;

import java.util.HashMap;
import java.util.Map;

@EnableKafka
@EnableRetry
@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrap;

    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> cfg = new HashMap<>();
        cfg.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrap);
        cfg.put(ConsumerConfig.GROUP_ID_CONFIG, "notification-service");
        cfg.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        cfg.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        cfg.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);
        cfg.put(JsonDeserializer.TRUSTED_PACKAGES, "com.ducnm.common.event");
        cfg.put(JsonDeserializer.TYPE_MAPPINGS,
                "com.ducnm.common.event.BookingCreatedEvent:" + BookingCreatedEvent.class.getName()
                        + ",com.ducnm.common.event.BookingConfirmedEvent:" + BookingConfirmedEvent.class.getName());
        cfg.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, true);
        cfg.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        return new DefaultKafkaConsumerFactory<>(cfg);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());

        ExponentialBackOff backOff = new ExponentialBackOff(1_000L, 2.0);
        backOff.setMaxInterval(60_000L);
        backOff.setMaxElapsedTime(5 * 60_000L);
        factory.setCommonErrorHandler(new DefaultErrorHandler(backOff));
        return factory;
    }
}
