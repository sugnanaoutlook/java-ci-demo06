package com.example.demo.employee;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    public List<Employee> getAllEmployees() {
        return repository.findAll();
    }

    public Optional<Employee> getEmployeeById(Long id) {
        return repository.findById(id);
    }

    public List<Employee> getEmployeesByDept(String dept) {
        return repository.findByDept(dept);
    }

    public Employee createEmployee(Employee employee) {
        return repository.save(employee);
    }

    public Employee updateEmployee(Long id, Employee updated) {
        Employee existing = repository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));
        existing.setEmpname(updated.getEmpname());
        existing.setEmail(updated.getEmail());
        existing.setDept(updated.getDept());
        existing.setSalary(updated.getSalary());
        return repository.save(existing);
    }

    public void deleteEmployee(Long id) {
        if (!repository.existsById(id)) {
            throw new EmployeeNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
