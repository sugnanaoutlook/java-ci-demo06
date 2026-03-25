package com.example.demo.employee;

import jakarta.persistence.*;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long empid;

    @Column(nullable = false, length = 100)
    private String empname;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 50)
    private String dept;

    @Column(nullable = false)
    private Double salary;

    public Employee() {}

    public Employee(Long empid, String empname, String email, String dept, Double salary) {
        this.empid = empid;
        this.empname = empname;
        this.email = email;
        this.dept = dept;
        this.salary = salary;
    }

    public Long getEmpid()              { return empid; }
    public void setEmpid(Long empid)    { this.empid = empid; }

    public String getEmpname()                  { return empname; }
    public void setEmpname(String empname)      { this.empname = empname; }

    public String getEmail()                    { return email; }
    public void setEmail(String email)          { this.email = email; }

    public String getDept()                     { return dept; }
    public void setDept(String dept)            { this.dept = dept; }

    public Double getSalary()                   { return salary; }
    public void setSalary(Double salary)        { this.salary = salary; }
}
