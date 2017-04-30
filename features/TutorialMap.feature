Feature: Tutorial Map
  As a player of robbie the robot
  When opening the Tutorial Level
  I should be able to play, loose and win

  Scenario: Winning
    Given I open the level Tutorial
    When I move right
    And I move down
    And I move right
    And I move down
    When I run my program
    Then I should see the win notification

  Scenario: Loosing
    Given I open the level Tutorial
    When I move right
    And I move right
    And I move right
    When I run my program
    Then I should see the loose notification