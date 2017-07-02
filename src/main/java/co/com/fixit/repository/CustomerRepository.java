package co.com.fixit.repository;

import co.com.fixit.domain.Customer;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.*;
import java.util.List;

/**
 * Spring Data JPA repository for the Customer entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CustomerRepository extends JpaRepository<Customer,Long> {

    @Query("select customer from Customer customer where customer.user.login = ?#{principal.username}")
    List<Customer> findByUserIsCurrentUser();
    
}
