package com.example.demo.employee;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EmployeeController.class)
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmployeeService service;

    @Autowired
    private ObjectMapper objectMapper;

    private Employee emp1;
    private Employee emp2;

    @BeforeEach
    void setUp() {
        emp1 = new Employee(1L, "Alice Johnson", "alice@example.com", "Engineering", 75000.0);
        emp2 = new Employee(2L, "Bob Smith",     "bob@example.com",   "HR",          55000.0);
    }

    @Test
    void getAllEmployees_returns200WithList() throws Exception {
        when(service.getAllEmployees()).thenReturn(Arrays.asList(emp1, emp2));

        mockMvc.perform(get("/api/employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].empname").value("Alice Johnson"))
                .andExpect(jsonPath("$[1].empname").value("Bob Smith"));
    }

    @Test
    void getEmployeeById_found_returns200() throws Exception {
        when(service.getEmployeeById(1L)).thenReturn(Optional.of(emp1));

        mockMvc.perform(get("/api/employees/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.empid").value(1))
                .andExpect(jsonPath("$.empname").value("Alice Johnson"))
                .andExpect(jsonPath("$.dept").value("Engineering"));
    }

    @Test
    void getEmployeeById_notFound_returns404() throws Exception {
        when(service.getEmployeeById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/employees/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getByDept_returns200WithFilteredList() throws Exception {
        when(service.getEmployeesByDept("Engineering")).thenReturn(List.of(emp1));

        mockMvc.perform(get("/api/employees/dept/Engineering"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].dept").value("Engineering"));
    }

    @Test
    void createEmployee_returns201WithCreatedEmployee() throws Exception {
        when(service.createEmployee(any(Employee.class))).thenReturn(emp1);

        mockMvc.perform(post("/api/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emp1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.empname").value("Alice Johnson"));
    }

    @Test
    void updateEmployee_returns200WithUpdatedEmployee() throws Exception {
        Employee updated = new Employee(1L, "Alice Updated", "alice2@example.com", "DevOps", 90000.0);
        when(service.updateEmployee(eq(1L), any(Employee.class))).thenReturn(updated);

        mockMvc.perform(put("/api/employees/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.empname").value("Alice Updated"))
                .andExpect(jsonPath("$.dept").value("DevOps"));
    }

    @Test
    void updateEmployee_notFound_returns404() throws Exception {
        when(service.updateEmployee(eq(99L), any(Employee.class)))
                .thenThrow(new EmployeeNotFoundException(99L));

        mockMvc.perform(put("/api/employees/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emp1)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteEmployee_returns204() throws Exception {
        doNothing().when(service).deleteEmployee(1L);

        mockMvc.perform(delete("/api/employees/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteEmployee_notFound_returns404() throws Exception {
        doThrow(new EmployeeNotFoundException(99L)).when(service).deleteEmployee(99L);

        mockMvc.perform(delete("/api/employees/99"))
                .andExpect(status().isNotFound());
    }
}
