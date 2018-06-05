<?php
namespace mod_classroom\output;

class renderer extends \plugin_renderer_base {

    public function render_view(\templatable $viewpage) {
        $data = $viewpage->export_for_template($this);
        return $this->render_from_template('mod_classroom/viewpage', $data);
    }
}
