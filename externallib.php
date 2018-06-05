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
 * External Web Service Template
 *
 * @package    localwstemplate
 * @copyright  2011 Moodle Pty Ltd (http://moodle.com)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
require_once($CFG->libdir . "/externallib.php");
require_once(__DIR__ . "/lib.php");
class mod_classroom_external extends external_api {
    /**
     * Returns description of method parameters
     * @return external_function_parameters
     */
    public static function hello_world_parameters() {
        return new external_function_parameters(
                array('welcomemessage' => new external_value(PARAM_TEXT, 'The welcome message. By default it is "Hello world,"', VALUE_DEFAULT, 'Hello world, '))
        );
    }
    /**
     * Returns welcome message
     * @return string welcome message
     */
    public static function hello_world($welcomemessage = 'Hello world, ') {
        global $USER;
        //Parameter validation
        //REQUIRED
        $params = self::validate_parameters(self::hello_world_parameters(),
                array('welcomemessage' => $welcomemessage));
        //Context validation
        //OPTIONAL but in most web service it should present
        $context = get_context_instance(CONTEXT_USER, $USER->id);
        self::validate_context($context);
        //Capability checking
        //OPTIONAL but in most web service it should present
        if (!has_capability('moodle/user:viewdetails', $context)) {
            throw new moodle_exception('cannotviewprofile');
        }
        return $params['welcomemessage'] . $USER->firstname ;;
    }
    /**
     * Returns description of method result value
     * @return external_description
     */
    public static function hello_world_returns() {
        return new external_value(PARAM_TEXT, 'The welcome message + user first name');
    }




    /**
     * Returns description of method parameters
     * @return external_function_parameters
     */
    public static function is_teacher_parameters() {
      return new external_function_parameters(
              array(
                'classroom_id' => new external_value(PARAM_INT, 'Classroom id')
              )
      );
    }
    /**
     * Returns welcome message
     * @return string welcome message
     */
    public static function is_teacher($classroom_id = null ) {
        global $USER, $COURSE;
        //Parameter validation
        //REQUIRED
        $params = self::validate_parameters(self::is_teacher_parameters(),
                array('classroom_id' => $classroom_id));
        //Context validation
        //OPTIONAL but in most web service it should present
        $context = get_context_instance(CONTEXT_USER, $USER->id);
        self::validate_context($context);
        //$roles = get_user_roles($context, $USER->id, false);

        $ret = new stdClass();
        $ret->status = "success";

        // $cm  = get_coursemodule_from_id('classroom', $classroom_id, 0, false, MUST_EXIST);
        // $context_course = context_module::instance($cm->id);
        $context_course = context_course::instance($COURSE->id);
        if (has_capability('mod/classroom:addinstance', $context_course) ) {
            $ret->is_teacher = true;
        }else{
            $ret->is_teacher = false;
        }

        return json_encode($ret);
    }
    /**
     * Returns description of method result value
     * @return external_description
     */
    public static function is_teacher_returns() {
        return new external_value(PARAM_RAW, 'Is teacher check');
    }





    /**
     * Returns description of method parameters
     * @return external_function_parameters
     */
    public static function is_initiated_parameters() {
      return new external_function_parameters(
              array(
                'classroom_id' => new external_value(PARAM_INT, 'Classroom id')
              )
      );
    }
    /**
     * Returns welcome message
     * @return string welcome message
     */
    public static function is_initiated($classroom_id = null ) {
        global $USER, $DB;
        //Parameter validation
        //REQUIRED
        $params = self::validate_parameters(self::is_initiated_parameters(),
                array('classroom_id' => $classroom_id));
        //Context validation
        //OPTIONAL but in most web service it should present
        $context = get_context_instance(CONTEXT_USER, $USER->id);
        self::validate_context($context);
        //$roles = get_user_roles($context, $USER->id, false);

        $ret = new stdClass();
        $ret->status = "success";

        // $cm  = get_coursemodule_from_id('classroom', $classroom_id, 0, false, MUST_EXIST);
        // $context_course = context_module::instance($cm->id);
        $results = $DB->get_records('classroom_offers', array('classroom'=>$classroom_id) );
        if( !empty($results) ){
            $ret->is_initiated = true;
        }

        return json_encode($ret);
    }
    /**
     * Returns description of method result value
     * @return external_description
     */
    public static function is_initiated_returns() {
        return new external_value(PARAM_RAW, 'Is initiated check');
    }





    /**
     * Returns description of method parameters
     * @return external_function_parameters
     */
    public static function set_offer_parameters() {
        return new external_function_parameters(
                array(
                  'classroom_id' => new external_value(PARAM_INT, 'Classroom id'),
                  'is_instructor' => new external_value(PARAM_BOOL, 'Whether the user is an instructor'),
                  'offer' => new external_value(PARAM_TEXT, 'Peer connection offer'),
                  'webcam_stream_id' => new external_value(PARAM_TEXT, 'Webcam stream id')
                )
        );
    }
    /**
     * Returns welcome message
     * @return string welcome message
     */
    public static function set_offer($classroom_id = null, $is_instructor = false, $offer = '', $webcam_stream_id = null) {
        global $USER, $DB;
        //Parameter validation
        //REQUIRED
        $params = self::validate_parameters(self::set_offer_parameters(),
                array(
                  'classroom_id' => $classroom_id,
                  'is_instructor' => $is_instructor,
                  'offer' => $offer,
                  'webcam_stream_id' => $webcam_stream_id
                ));
        //Context validation
        //OPTIONAL but in most web service it should present
        $context = get_context_instance(CONTEXT_USER, $USER->id);
        self::validate_context($context);
        //Capability checking
        //OPTIONAL but in most web service it should present
        // if (!has_capability('moodle/user:viewdetails', $context)) {
        //     throw new moodle_exception('cannotviewprofile');
        // }\

        // set is initiated
        if (! $classroom = $DB->get_record('classroom', array('id' => $classroom_id))) {
            return false;
        }
        if( $is_instructor && !$classroom->is_initiated ){
            $classroom->is_initiated = true;
            $classroom->timemodified = time();
            $DB->update_record('classroom', $classroom);
        }

        // create offer
        $offerObj = new stdClass();
        $offerObj->user = $USER->id;
        $offerObj->classroom = $classroom_id;
        $offerObj->is_instructor = $is_instructor;
        $offerObj->offer = $offer;
        $offerObj->webcam_stream_id = $webcam_stream_id;
        $offerObj->timecreated = time();

        $offerObj->id = $DB->insert_record('classroom_offers', $offerObj);

        return '{"status": "success", "offer_id": '.$offerObj->id.'}';
    }
    /**
     * Returns description of method result value
     * @return external_description
     */
    public static function set_offer_returns() {
        return new external_value(PARAM_RAW, 'Status JSON');
    }



    /**
     * Returns description of method parameters
     * @return external_function_parameters
     */
    public static function set_answer_parameters() {
        return new external_function_parameters(
                array(
                  'classroom_id' => new external_value(PARAM_INT, 'Classroom id'),
                  'offer_id' => new external_value(PARAM_INT, 'Offer id'),
                  'answer' => new external_value(PARAM_TEXT, 'Peer connection answer')
                )
        );
    }
    /**
     * Returns welcome message
     * @return string welcome message
     */
    public static function set_answer($classroom_id = null, $offer_id = null, $answer = '') {
        global $USER, $DB;
        //Parameter validation
        //REQUIRED
        $params = self::validate_parameters(self::set_answer_parameters(),
                array(
                  'classroom_id' => $classroom_id,
                  'offer_id' => $offer_id,
                  'answer' => $answer
                ));
        //Context validation
        //OPTIONAL but in most web service it should present
        $context = get_context_instance(CONTEXT_USER, $USER->id);
        self::validate_context($context);
        //Capability checking
        //OPTIONAL but in most web service it should present
        // if (!has_capability('moodle/user:viewdetails', $context)) {
        //     throw new moodle_exception('cannotviewprofile');
        // }\

        // set is initiated
        if (! $classroom = $DB->get_record('classroom', array('id' => $classroom_id))) {
            return false;
        }

        // set locked by
        if (! $offerObj = $DB->get_record('classroom_offers', array('id' => $offer_id))) {
            return false;
        }
        $offerObj->locked_by = $USER->id;
        $DB->update_record('classroom_offers', $offerObj);

        // create offer
        $answerObj = new stdClass();
        $answerObj->user = $USER->id;
        $answerObj->offer = $offer_id;
        $answerObj->answer = $answer;
        $answerObj->timecreated = time();

        $answerObj->id = $DB->insert_record('classroom_answers', $answerObj);

        return '{"status": "success"}';
    }
    /**
     * Returns description of method result value
     * @return external_description
     */
    public static function set_answer_returns() {
        return new external_value(PARAM_RAW, 'Status JSON');
    }


    /**
     * Returns description of method parameters
     * @return external_function_parameters
     */
    public static function get_answer_parameters() {
        return new external_function_parameters(
                array(
                  'classroom_id' => new external_value(PARAM_INT, 'Classroom id'),
                  'offer_id' => new external_value(PARAM_INT, 'Offer id')
                )
        );
    }
    /**
     * Returns welcome message
     * @return string welcome message
     */
    public static function get_answer($classroom_id = null, $offer_id = null) {
        global $USER, $DB;
        //Parameter validation
        //REQUIRED
        $params = self::validate_parameters(self::get_answer_parameters(),
                array(
                  'classroom_id' => $classroom_id,
                  'offer_id' => $offer_id
                ));
        //Context validation
        //OPTIONAL but in most web service it should present
        $context = get_context_instance(CONTEXT_USER, $USER->id);
        self::validate_context($context);
        //Capability checking
        //OPTIONAL but in most web service it should present
        // if (!has_capability('moodle/user:viewdetails', $context)) {
        //     throw new moodle_exception('cannotviewprofile');
        // }\

        // set is initiated
        if (! $classroom = $DB->get_record('classroom', array('id' => $classroom_id))) {
            return false;
        }

        $answer = $DB->get_record('classroom_answers', array('offer' => $offer_id));

        if( !$answer ){
            $ret = new stdClass();
            $ret->status = "failed";

            return json_encode($ret);
        }

        $ret = new stdClass();
        $ret->status = "success";
        $ret->user_id = $answer->user;

        $user = $DB->get_record('user', array( 'id'=> $answer->user ));
        $ret->username = $user->username;
        $ret->firstname = $user->firstname;
        $ret->lastname = $user->lastname;
        $ret->profilepic = classroom_get_profilepic_byid($user->id);

        $ret->answer = $answer->answer;

        return json_encode($ret);
    }
    /**
     * Returns description of method result value
     * @return external_description
     */
    public static function get_answer_returns() {
        return new external_value(PARAM_RAW, 'Status JSON');
    }


    /**
     * Returns description of method parameters
     * @return external_function_parameters
     */
    public static function get_instructor_offer_lock_parameters() {
        return new external_function_parameters(
                array(
                  'classroom_id' => new external_value(PARAM_INT, 'Classroom id')
                )
        );
    }
    /**
     * Returns welcome message
     * @return string welcome message
     */
    public static function get_instructor_offer_lock($classroom_id = null) {
        global $USER, $DB;
        //Parameter validation
        //REQUIRED
        $params = self::validate_parameters(self::get_instructor_offer_lock_parameters(),
                array(
                  'classroom_id' => $classroom_id
                ));
        //Context validation
        //OPTIONAL but in most web service it should present
        $context = get_context_instance(CONTEXT_USER, $USER->id);
        self::validate_context($context);
        //Capability checking
        //OPTIONAL but in most web service it should present
        // if (!has_capability('moodle/user:viewdetails', $context)) {
        //     throw new moodle_exception('cannotviewprofile');
        // }\

        // set is initiated
        if (! $classroom = $DB->get_record('classroom', array('id' => $classroom_id))) {
            return false;
        }

        // get an offer
        if( ! $unlockedOffer = $DB->get_record('classroom_offers', array('classroom' => $classroom_id, 'is_instructor' => 1, 'locked_by' => NULL ) ) ){
            $ret = new stdClass();
            $ret->status = "failed";

            return json_encode($ret);
        }

        $unlockedOffer->locked_by = $USER->id;
        $DB->update_record('classroom_offers', $unlockedOffer);

        $lockedOffer = $unlockedOffer;

        $ret = new stdClass();
        $ret->status = "success";
        $ret->user_id = $answer->user;
        $ret->offer_id = $unlockedOffer->id;

        $user = $DB->get_record('user', array( 'id'=> $lockedOffer->user ));
        $ret->username = $user->username;
        $ret->firstname = $user->firstname;
        $ret->lastname = $user->lastname;
        $ret->profilepic = classroom_get_profilepic_byid($user->id);

        $ret->offer = $lockedOffer->offer;
        $ret->webcam_stream_id = $lockedOffer->webcam_stream_id;

        return json_encode($ret);
    }
    /**
     * Returns description of method result value
     * @return external_description
     */
    public static function get_instructor_offer_lock_returns() {
        return new external_value(PARAM_RAW, 'Status JSON');
    }



    /**
     * Returns description of method parameters
     * @return external_function_parameters
     */
    public static function get_student_offer_lock_parameters() {
        return new external_function_parameters(
                array(
                  'classroom_id' => new external_value(PARAM_INT, 'Classroom id')
                )
        );
    }
    /**
     * Returns welcome message
     * @return string welcome message
     */
    public static function get_student_offer_lock($classroom_id = null) {
        global $USER, $DB;
        //Parameter validation
        //REQUIRED
        $params = self::validate_parameters(self::get_student_offer_lock_parameters(),
                array(
                  'classroom_id' => $classroom_id
                ));
        //Context validation
        //OPTIONAL but in most web service it should present
        $context = get_context_instance(CONTEXT_USER, $USER->id);
        self::validate_context($context);
        //Capability checking
        //OPTIONAL but in most web service it should present
        // if (!has_capability('moodle/user:viewdetails', $context)) {
        //     throw new moodle_exception('cannotviewprofile');
        // }\

        // set is initiated
        if (! $classroom = $DB->get_record('classroom', array('id' => $classroom_id))) {
            return false;
        }

        // get an offer
        if( ! $unlockedOffer = $DB->get_record('classroom_offers', array('classroom' => $classroom_id, 'is_instructor' => 0, 'locked_by' => NULL ) ) ){
            $ret = new stdClass();
            $ret->status = "failed";

            return json_encode($ret);
        }

        if( $unlockedOffer->user == $USER->id ){
            $ret = new stdClass();
            $ret->status = "failed";

            return json_encode($ret);
        }

        $unlockedOffer->locked_by = $USER->id;
        $DB->update_record('classroom_offers', $unlockedOffer);

        $lockedOffer = $unlockedOffer;

        $ret = new stdClass();
        $ret->status = "success";
        $ret->user_id = $answer->user;
        $ret->offer_id = $unlockedOffer->id;

        $user = $DB->get_record('user', array( 'id'=> $lockedOffer->user ));
        $ret->username = $user->username;
        $ret->firstname = $user->firstname;
        $ret->lastname = $user->lastname;
        $ret->profilepic = classroom_get_profilepic_byid($user->id);

        $ret->offer = $lockedOffer->offer;
        $ret->webcam_stream_id = $lockedOffer->webcam_stream_id;

        return json_encode($ret);
    }
    /**
     * Returns description of method result value
     * @return external_description
     */
    public static function get_student_offer_lock_returns() {
        return new external_value(PARAM_RAW, 'Status JSON');
    }


    /**
     * Returns description of method parameters
     * @return external_function_parameters
     */
    public static function terminate_classroom_parameters() {
        return new external_function_parameters(
                array(
                  'classroom_id' => new external_value(PARAM_INT, 'Classroom id')
                )
        );
    }
    /**
     * Returns welcome message
     * @return string welcome message
     */
    public static function terminate_classroom($classroom_id = null) {
        global $USER, $DB;
        //Parameter validation
        //REQUIRED
        $params = self::validate_parameters(self::terminate_classroom_parameters(),
                array(
                  'classroom_id' => $classroom_id
                ));
        //Context validation
        //OPTIONAL but in most web service it should present
        $context = get_context_instance(CONTEXT_USER, $USER->id);
        self::validate_context($context);
        //Capability checking
        //OPTIONAL but in most web service it should present
        // if (!has_capability('moodle/user:viewdetails', $context)) {
        //     throw new moodle_exception('cannotviewprofile');
        // }\

        // set is initiated
        if (! $classroom = $DB->get_record('classroom', array('id' => $classroom_id))) {
            return false;
        }

        $ret = new stdClass();
        if( $offers = $DB->get_records('classroom_offers', array('classroom'=>$classroom_id)) ){
            foreach( $offers as $offer ){
                $DB->delete_records('classroom_answers', array('offer'=>$offer->id) );
            }

            $DB->delete_records('classroom_offers', array( 'classroom' => $classroom_id ) );
            $ret->status = 'success';
        }else{
          $ret->status = 'failed';
        }


        return json_encode($ret);
    }
    /**
     * Returns description of method result value
     * @return external_description
     */
    public static function terminate_classroom_returns() {
        return new external_value(PARAM_RAW, 'Status JSON');
    }
}
