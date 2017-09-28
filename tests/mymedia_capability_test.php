<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Unit tests for YU Kaltura mymedia local plugin capabilities
 *
 * @package    local_yumymedia
 * @copyright  (C) 2008-2013 Remote-Learner Inc http://www.remote-learner.net
 * @copyright  (C) 2016-2017 Yamaguchi University <info-cc@ml.cc.yamaguchi-u.ac.jp>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once(dirname(__FILE__).'/../lib.php');

/**
 * Capability testcase class of local_yumymedia
 * @package local_yukaltura
 * @copyright  (C) 2008-2013 Remote-Learner Inc http://www.remote-learner.net
 * @copyright  (C) 2016-2017 Yamaguchi University <info-cc@ml.cc.yamaguchi-u.ac.jp>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class yumymedia_capability_testcase extends advanced_testcase {

    /**
     * This function reset attributes.
     * @access protected
     * @param none.
     * @return nothing.
     */
    protected function setUp() {
        parent::setUp();
        $this->resetAfterTest(true);
    }

    /**
     * Test function that check capability reports found.
     * @access public
     * @param none.
     * @return nothing.
     */
    public function test_local_yumymedia_check_capability_found() {
        global $DB;

        $user = $this->getDataGenerator()->create_user();
        $this->setUser($user);
        $course = $this->getDataGenerator()->create_course(array('idnumber' => 'crs1',
                                                                 'fullname' => 'course1',
                                                                 'shortname' => 'crs1'
                                                                )
                                                          );
        $role = $DB->get_record('role', array('shortname' => 'student'));
        $coursecontext = context_course::instance($course->id);
        role_assign($role->id, $user->id, $coursecontext->id);
        assign_capability('local/yumymedia:sharecourse', CAP_ALLOW, $role->id, $coursecontext);
        assign_capability('local/yumymedia:sharesite', CAP_ALLOW, $role->id, $coursecontext);

        $result = local_yumymedia_check_capability('local/yumymedia:sharecourse');
        $this->assertTrue($result);

        $result = local_yumymedia_check_capability('local/yumymedia:sharesite');
        $this->assertTrue($result);
    }

    /**
     * Test function that checks capability reports missing.
     * @access public
     * @param none.
     * @return nothing.
     */
    public function test_local_yumymedia_check_capability_missing() {
        $result = local_yumymedia_check_capability('local/yumymedia:sharecourse');
        $this->assertFalse($result);

        $result = local_yumymedia_check_capability('local/yumymedia:sharesite');
        $this->assertFalse($result);
    }
}
