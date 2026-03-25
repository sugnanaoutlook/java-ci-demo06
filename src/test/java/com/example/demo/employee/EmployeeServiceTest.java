package com.example.demo.employee;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository repository;

    @InjectMocks
    private EmployeeService service;

    private Employee emp1;
    private Employee emp2;

    @BeforeEach
    void setUp() {
        emp1 = new Employee(1L, "Alice Johnson", "alice@example.com", "Engineering", 75000.0);
        emp2 = new Employee(2L, "Bob Smith",     "bob@example.com",   "HR",          55000.0);
    }

    @Test
    void getAllEmployees_returnsAllEmployees() {
        when(repository.findAll()).thenReturn(Arrays.asList(emp1, emp2));

        List<Employee> result = service.getAllEmployees();

        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(emp1, emp2);
    }

    @Test
    void getEmployeeById_found_returnsEmployee() {
        when(repository.findById(1L)).thenReturn(Optional.of(emp1));

        Optional<Employee> result = service.getEmployeeById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getEmpname()).isEqualTo("Alice Johnson");
    }

    @Test
    void getEmployeeById_notFound_returnsEmpty() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        Optional<Employee> result = service.getEmployeeById(99L);

        assertThat(result).isEmpty();
    }

    @Test
    void getEmployeesByDept_returnsDeptEmployees() {
        when(repository.findByDept("Engineering")).thenReturn(List.of(emp1));

        List<Employee> result = service.getEmployeesByDept("Engineering");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDept()).isEqualTo("Engineering");
    }

    @Test
    void createEmployee_savesAndReturnsEmployee() {
        when(repository.save(emp1)).thenReturn(emp1);

        Employee result = service.createEmployee(emp1);

        assertThat(result).isEqualTo(emp1);
        verify(repository, times(1)).save(emp1);
    }

    @Test
    void updateEmployee_updatesAndReturnsEmployee() {
        Employee updated = new Employee(null, "Alice Updated", "alice2@example.com", "DevOps", 90000.0);
        when(repository.findById(1L)).thenReturn(Optional.of(emp1));
        when(repository.save(emp1)).thenReturn(emp1);

        Employee result = service.updateEmployee(1L, updated);

        assertThat(result.getEmpname()).isEqualTo("Alice Updated");
        assertThat(result.getDept()).isEqualTo("DevOps");
    }

    @Test
    void updateEmployee_notFound_throwsException() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateEmployee(99L, emp1))
                .isInstanceOf(EmployeeNotFoundException.class);
    }

    @Test
    void deleteEmployee_existingId_deletesSuccessfully() {
        when(repository.existsById(1L)).thenReturn(true);
        doNothing().when(repository).deleteById(1L);

        service.deleteEmployee(1L);

        verify(repository, times(1)).deleteById(1L);
    }

    @Test
    void deleteEmployee_notFound_throwsException() {
        when(repository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> service.deleteEmployee(99L))
                .isInstanceOf(EmployeeNotFoundException.class);
    }
}
