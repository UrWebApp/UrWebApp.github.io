# LIU YU KAI
**Integration Reliability Engineer | Distributed Systems & API Interoperability**

📧 carl12331@gmail.com | 📱 +91 900 846 8049 / +886 975 273 847  
🔗 [linkedin.com/in/kai98k](https://www.linkedin.com/in/kai98k) | 💻 [github.com/kai98k](https://github.com/kai98k)

---

## Professional Summary

Results-oriented Integration Reliability Engineer with 3+ years of experience architecting and **stabilizing mission-critical enterprise systems** in global supply chain and manufacturing sectors. Proven expertise in **API interoperability**, event-driven architecture, and ensuring **data integrity in high-volume transactional environments**. Skilled in bridging the gap between technical engineering and external partners (DHL, FedEx, DCSA carriers), delivering resilient integrations with retry mechanisms and graceful degradation. Adept at root cause analysis, system observability (Prometheus, Kibana), and automating manual workflows. Committed to **Operational Excellence**, **Rigorous Thinking**, and a **Users First** approach to engineering.

---

## Work Experience

### Software Engineer (Team Lead)
**Hon Hai Technology Group (Foxconn)** | Bengaluru, India | Sep 2025 – Present

- **System Observability & Reliability**: Maintain Spring Cloud microservices dashboard monitoring container health, uptime, and centralized logging — achieving **98% system availability** with plans to implement auto-recovery for 99.9% target
- **Built local engineering team from scratch** (3-5 members) under strict Apple ISM security policies; established remote development workflow to China HQ as interim solution for dependency approval bottlenecks
- **Architected polyglot microservices platform** (K3s + Istio) with planned observability stack (Prometheus + Kibana + sidecar pattern) enabling automatic failure detection and self-healing deployments
- **Event-Driven Architecture**: Implemented RabbitMQ as message broker for inter-service communication with automatic message retry on consumer/publisher failures — ensuring reliable data flow across distributed services
- **Led system internationalization** from China to India: overcame fragmented documentation and outdated configs — leveraged internal AI Agent to consolidate scattered docs into systematic knowledge base, **successfully onboarded 3 systems to date**
- Established **GitLab CI/CD pipelines** for containerized deployments — **reducing deployment time from days to hours**
- Serve as **technical bridge** between China development team and India operations, coordinating incident response across Taiwan, India, and China

### Software Engineer
**Evergreen Marine Corp.** | Taoyuan, Taiwan | Mar 2025 – Sep 2025

- **API Standardization & Compliance**: Developed Bill of Lading (B/L) APIs in strict compliance with **DCSA standards** — documents serving as legal proof of cargo ownership and financial settlement basis, requiring zero-tolerance for data errors (analogous to financial transaction records)
- **Participated in weekly DCSA standards meetings** with the world's 9 largest ocean carriers (75% of global container trade); contributed to Booking and B/L API specification development
- **Developed Evergreen Developer Portal** for enterprise customers (IKEA, Volvo) and freight forwarders to self-service integrate shipping APIs — **reduced partner onboarding time**
- **Built container verification API** integrating automated measurement systems to validate weight/volume against customer declarations — **eliminated manual checking, reducing verification time from hours to seconds**
- Utilized **Kafka** for event-driven message processing and **Oracle** for reliable data flow; gathered requirements from external partners and translated business needs into technical specs

### Full-Stack Engineer
**Advantech Corp.** | Taipei, Taiwan | Nov 2023 – Mar 2025

- **Fault-Tolerant Partner Integration**: Integrated third-party logistics APIs (DHL, FedEx, Taiwan carriers) with **retry mechanisms and timeout handling** — designed to gracefully handle intermittent partner API failures while ensuring reliable order processing
- **Event-Driven Order Processing**: Implemented RabbitMQ-based architecture where order events automatically route to ShippingOrder service, dynamically calling appropriate carrier APIs based on order requirements — warehouse staff scan internal SN barcode → system auto-retrieves shipping label → auto-prints
- **System Observability**: Deployed container monitoring with **Heartbeat + Prometheus + Kibana** for proactive failure detection and alerting
- **Transformed manual workflow into automated solution**: warehouse staff previously created shipping labels one-by-one on carrier websites — **reduced processing time by 30%**
- **Unified multi-carrier integration** using adapter/factory design patterns into single interface; downstream teams integrate once instead of building separate connections — **reduced integration effort significantly**
- **Architected data model migration** from relational (MS SQL) to document-based (MongoDB): packaging data restructured into nested documents — **improved API response time by 40%**
- **Designed MongoDB sharding strategy** by region/factory for horizontal scaling and data locality
- Migrated legacy VB.NET/.NET Framework to **.NET Core microservices** with API Gateway and **Jenkins CI/CD** — **reduced deployment cycle from weeks to days**
- Integrated **SAP HANA via RFC** for real-time ERP synchronization; built **PWA** optimized for warehouse PDA devices

---

## Technical Skills

| Category | Technologies |
|----------|-------------|
| **Integration & Messaging** | RESTful API Design, RabbitMQ, Kafka, Event-Driven Architecture, Webhooks, Third-Party Integration (Logistics/ERP) |
| **Reliability & Observability** | Prometheus, Kibana, Heartbeat, Log Analysis, Container Monitoring, Retry Mechanisms, Circuit Breaker Patterns |
| **Backend & Data** | Java (Spring Boot/Cloud), C# (.NET Core), Python (FastAPI), Go, SQL (Oracle/PostgreSQL/MS SQL), MongoDB (Sharding) |
| **Infrastructure** | K3s/Kubernetes, Istio, Docker, Linux, GitLab CI/CD, Jenkins |
| **Frontend** | Angular 2+, Vue.js, TypeScript, HTML/CSS/SCSS |
| **Cloud & Certifications** | AWS (Certified AI Practitioner), Azure (Certified Fundamentals) |

---

## Key Achievements

- **Reliability Engineering**: Achieved 98% system availability with container monitoring and alerting; designing auto-recovery mechanisms targeting 99.9%
- **Partner Integration**: Built fault-tolerant integrations with 3+ logistics partners featuring retry logic, timeout handling, and graceful degradation
- **Industry Standards**: Contributed to DCSA API specifications adopted by 9 major ocean carriers representing 75% of global container trade
- **Cross-border Coordination**: Led system internationalization across 3 countries (Taiwan, India, China) with zero critical incidents

---

## Certifications

- **AWS Certified AI Practitioner**
- **Microsoft Certified: Azure Fundamentals**

---

## Education

**National Chiayi University** | Sep 2017 – Jun 2021  
B.A. in Foreign Languages

---

## Languages

- **Mandarin Chinese**: Native
- **English**: Professional working proficiency