<?php
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
 * Web service local plugin template external functions and service definitions.
 *
 * @package    localwstemplate
 * @copyright  2011 Jerome Mouneyrac
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
// We defined the web service functions to install.
$functions = array(
        'mod_classroom_hello_world' => array(
                'classname'   => 'mod_classroom_external',
                'methodname'  => 'hello_world',
                'classpath'   => 'mod/classroom/externallib.php',
                'description' => 'Return Hello World FIRSTNAME. Can change the text (Hello World) sending a new text as parameter',
                'type'        => 'read',
                'ajax'        => true,
        ),
        'mod_classroom_is_teacher' => array(
                'classname'   => 'mod_classroom_external',
                'methodname'  => 'is_teacher',
                'classpath'   => 'mod/classroom/externallib.php',
                'description' => 'Checks if the user is a teacher',
                'type'        => 'read',
                'ajax'        => true,
        ),
        'mod_classroom_is_initiated' => array(
                'classname'   => 'mod_classroom_external',
                'methodname'  => 'is_initiated',
                'classpath'   => 'mod/classroom/externallib.php',
                'description' => 'Checks if the classroom is initiated',
                'type'        => 'read',
                'ajax'        => true,
        ),
        'mod_classroom_set_offer' => array(
                'classname'   => 'mod_classroom_external',
                'methodname'  => 'set_offer',
                'classpath'   => 'mod/classroom/externallib.php',
                'description' => 'Save peer connection offer in the DB',
                'type'        => 'write',
                'ajax'        => true,
        ),
        'mod_classroom_get_answer' => array(
                'classname'   => 'mod_classroom_external',
                'methodname'  => 'get_answer',
                'classpath'   => 'mod/classroom/externallib.php',
                'description' => 'Get peer connection answer from the DB',
                'type'        => 'write',
                'ajax'        => true,
        ),
        'mod_classroom_set_answer' => array(
                'classname'   => 'mod_classroom_external',
                'methodname'  => 'set_answer',
                'classpath'   => 'mod/classroom/externallib.php',
                'description' => 'Set peer connection answer to the DB',
                'type'        => 'write',
                'ajax'        => true,
        ),
        'mod_classroom_get_instructor_offer_lock' => array(
                'classname'   => 'mod_classroom_external',
                'methodname'  => 'get_instructor_offer_lock',
                'classpath'   => 'mod/classroom/externallib.php',
                'description' => 'Get instructor offer lock',
                'type'        => 'write',
                'ajax'        => true,
        ),
        'mod_classroom_get_student_offer_lock' => array(
                'classname'   => 'mod_classroom_external',
                'methodname'  => 'get_student_offer_lock',
                'classpath'   => 'mod/classroom/externallib.php',
                'description' => 'Get student offer lock',
                'type'        => 'write',
                'ajax'        => true,
        ),
        'mod_classroom_terminate_classroom' => array(
                'classname'   => 'mod_classroom_external',
                'methodname'  => 'terminate_classroom',
                'classpath'   => 'mod/classroom/externallib.php',
                'description' => 'Terminate classroom session',
                'type'        => 'write',
                'ajax'        => true,
        )
);
