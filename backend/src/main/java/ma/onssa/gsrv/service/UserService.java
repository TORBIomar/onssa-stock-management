package ma.onssa.gsrv.service;


import ma.onssa.gsrv.entity.User;
import ma.onssa.gsrv.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User create(String username, String rawPassword, String email, String role) {
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setEmail(email);
        user.setRole(role);
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    @Transactional(readOnly = true)
    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }

    @Transactional(readOnly = true)
    public List<User> listAll() {
        return userRepository.findAll();
    }

    public User update(Long id, String username, String email, String role) {
        User user = getById(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setRole(role);
        return userRepository.save(user);
    }

    public void delete(Long id) {
        User user = getById(id);
        userRepository.delete(user);
    }

    public User toggleStatus(Long id) {
        User user = getById(id);
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    public User findById(Long id) {
        return getById(id);
    }

    public User resetPassword(Long id, String newPassword) {
        User user = getById(id);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }
}


