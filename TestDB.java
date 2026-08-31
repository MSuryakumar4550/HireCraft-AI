import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class TestDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/hirecraft_ai";
        String user = "postgres";
        String password = "Surya@123";
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
             
            System.out.println("AI Memory Items:");
            ResultSet rs = stmt.executeQuery("SELECT * FROM ai_memory_items");
            while (rs.next()) {
                System.out.println("Memory ID: " + rs.getString("memory_id") + " Key: " + rs.getString("memory_key"));
            }
            rs.close();
            
            System.out.println("\nAptitude Assessments:");
            rs = stmt.executeQuery("SELECT aptitude_assessment_id, status, score FROM aptitude_assessments");
            while (rs.next()) {
                System.out.println("ID: " + rs.getString("aptitude_assessment_id") + " Status: " + rs.getString("status") + " Score: " + rs.getString("score"));
            }
            rs.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
