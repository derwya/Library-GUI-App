package com.alex;
import com.alex.config.Port;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.util.SocketUtils;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.util.Collections;

@SpringBootApplication
public class Application {

    public static void main(String[] args) throws IOException {
        int port = SocketUtils.findAvailableTcpPort();
        SpringApplication app = new SpringApplication(Application.class);
        app.setDefaultProperties(Collections.singletonMap("server.port", String.valueOf(port)));
        app.run(args);

        File file = new File("./src/main/java/com/alex/front-app/config.json");
        ObjectMapper mapper = new ObjectMapper();
        ObjectWriter writer = mapper.writer(new DefaultPrettyPrinter());

        String host = InetAddress.getLoopbackAddress().getHostName();

        writer.writeValue(file, new Port(port, host));
    }

}